define(function(require, exports, module) {
  'use strict';
  /**
   * @module Butter.View
   */
  var _ = require('./utils/helpers'),
    defaults = require('./utils/defaults'),
    mixins = require('./utils/mixins');

  module.exports = function(options) {

    /**
     * Initialize this class with the options passed to it
     * @private
     */
    this._constructor = function() {
      // extend this class with the default mixins used for any Butter class
      _.extend(true, this, mixins);
      // getting some useful options shared between any view class
      _.extend(true, this, defaults.view);

      this.bindings = [];
      this.views = [];
      this.template = options.template;
      this.destroyDataOnRemove = false;
      // Special property representing the state of the current view
      this.state = new Bacon.Bus();

      // Extend this view with some other custom events passed via options
      _.each(options, function(key, value) {
        if (typeof value === 'function') {
          this[key] = value;
        } else if (key === 'data') {
          if (value instanceof Butter.Data) {
            this[key] = value;
          } else {
            this[key] = new Butter.Data(value);
            if (this.destroyDatasCreated) {
              this.destroyDataOnRemove = true;
            }
          }
        }
      }, this);

      if (options.el) {
        this.setElement(options.el);
      }

      this.state.onValue(_.bind(this.exec, this));

      return this;
    };

    /**
     * Borrowed from Backbone
     * @public
     */
    this.setElement = function(el) {
      this.$el = el instanceof _.$ ? options.el : _.$(el);
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
      return _.$(selector, this.$el);
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
      _.each(options.events, function(i, event) {
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
      _.each(options.events, function(i, event) {
        this[event.name] = this.$el.asEventStream(event.type, event.el);
      }, this);
      // Bind the markup binders
      //_.each(this.$('*', this.$el), this.parse, this);
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
      if (this.destroyDataOnRemove) {
        this.model.destroy();
      }
      this.$el.remove();
      this.removeProperties();
    };

    // initialize this class
    return this._constructor();

  };
});