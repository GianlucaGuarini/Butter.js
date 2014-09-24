/**
 * @module View
 */

module.exports = function(options) {
  /**
   * Private stuff
   * @private
   */
  var self = this,
    exec = function(callback) {
      if (typeof self[callback] === 'function') {
        self[callback].apply(self, arguments);
      }
    };

  /**
   * Public properties
   * @public
   */
  this.bindings = [];
  this.views = [];
  // Special property representing the state of the current view
  this.state = new Bacon.Bus();

  /**
   * Borrowed from Backbone
   * @private
   */
  this._setElement = function() {
    this.$el = options.el instanceof $ ? options.el : $(options.el);
    this.el = this.$el[0];
    if (!this.el) {
      console.warn(options.el + 'was not found!');
    }
    return this;
  };
  /**
   * Initialize this class with the options passed to it
   * @private
   */
  this._constructor = function() {
    // Extend this view with some other custom events passed via options

    for (var key in options) {
      var option = options[key];
      if (typeof option === 'function') {
        this[key] = option;
      }
    }

    this._setElement();

    exec('initialize');
    this.state.onValue(exec);

    return this;
  };
  /**
   * Render the markup and bind the model to the DOM
   * @public
   */
  this.render = function() {

    this.state.push('beforeRender');
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
    $(options.events).each(function(i, event) {
      if (self[event.name]) {
        self[event.name].onValue()();
        self[event.name] = null;
      }
    });
    return this;
  };

  /**
   * Delegate the events streams to the child nodes of this view
   * @public
   */
  this.bind = function() {
    this.unbind();
    $(options.events).each(function(i, event) {
      self[event.name] = self.$el.asEventStream(event.type, event.el);
    });
    return this;
  };
  /**
   * Remove this view its subViews and all the events
   */
  this.remove = function() {
    this.state.push('beforeRemove');
    this.state.end();
    this.$el.remove();
    $(this).each(function(i, prop) {
      self[prop] = null;
    });
  };

  // init
  this._constructor();

  return this;
};