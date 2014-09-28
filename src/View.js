/**
 * @module Butter.View
 */
Butter.View = function(options) {
  /**
   * Initialize this class with the options passed to it
   * @private
   */
  this._constructor = function() {

    Butter.helpers.extend(true, this, Butter.mixins);

    this.bindings = [];
    this.views = [];
    this.template = options.template;
    this.destroyModelOnRemove = false;
    // Special property representing the state of the current view
    this.state = new Bacon.Bus();
    this.defaults = Butter.defaults.view;

    // Extend this view with some other custom events passed via options
    Butter.helpers.each(options, function(key, value) {
      if (typeof value === 'function') {
        this[key] = value;
      } else if (key === 'model') {
        if (value instanceof Butter.Model) {
          this[key] = value;
        } else {
          this[key] = new Butter.Model(value);
          if (this.destroyModelsCreated) {
            this.destroyModelOnRemove = true;
          }
        }
      }
    }, this);

    if (options.el) {
      this.setElement(options.el);
    }

    this.state.onValue(Butter.helpers.bind(this.exec, this));

    return this;
  };

  /**
   * Borrowed from Backbone
   * @public
   */
  this.setElement = function(el) {
    this.$el = el instanceof Butter.helpers.$ ? options.el : Butter.helpers.$(el);
    this.el = this.$el[0];
    if (!this.el) {
      console.warn(options.el + 'was not found!');
    }
    return this;
  };

  /**
   * Select any element in this view
   * @public
   */
  this.$ = function(selector) {
    return Butter.helpers.$(selector, this.$el);
  };
  /**
   * Render the markup and bind the model to the DOM
   * @public
   */
  this.render = function() {

    this.state.push('beforeRender');

    if (this.template) {
      this.$el.html(this.template);
    }

    this
      .bind()
      .state
      .push('afterRender');

    return this;
  };
  /**
   * Remove all the events from the child nodes
   * @public
   */
  this.unbind = function() {
    this.$el.off();
    Butter.helpers.each(options.events, function(i, event) {
      if (this[event.name]) {
        this[event.name].onValue()();
        this[event.name] = null;
      }
    }, this);
    return this;
  };

  /**
   * Delegate the events streams to the child nodes of this view
   * @public
   */
  this.bind = function() {
    this.unbind();
    // Bind the view events
    Butter.helpers.each(options.events, function(i, event) {
      this[event.name] = this.$el.asEventStream(event.type, event.el);
    }, this);
    // Bind the markup binders
    //Butter.helpers.each(this.$('*', this.$el), this.parse, this);
    return this;
  };

  this.parse = function(i, el) {

  };
  /**
   * Remove this view its subViews and all the events
   */
  this.remove = function() {
    this.state.push('beforeRemove');
    this.state.end();
    /**
     *  Destroy the model created with this view because we assume it's not shared with other views
     */
    if (this.destroyModelOnRemove) {
      this.model.destroy();
    }
    this.$el.remove();
    this.removeProperties();
  };

  // initialize this class
  return this._constructor();

};