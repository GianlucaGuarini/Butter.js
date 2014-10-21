define(function(require, exports, module) {
  'use strict';
  /**
   * @module Butter.View
   */
  var _ = require('./utils/helpers'),
    binders = require('./utils/binders'),
    defaults = require('./utils/defaults'),
    mixins = require('./utils/mixins');

  module.exports = function(options) {

    /**
     * Initialize this class with the options passed to it
     * @private
     */
    this._constructor = function() {
      // extend this class with the default mixins used for any Butter class
      _.extend(this, mixins);
      // getting some useful options shared between any view class
      _.extend(this, defaults.view);
      // extend this view with the options passed to its instance
      _.extend(this, options || {});

      this.binders = [];
      this.views = [];
      this.destroyDataOnRemove = false;
      // Special property representing the state of the current view
      this.state = new Bacon.Bus();

      this.setData(this.data);
      this.setElement(this.el);

      this.state.onValue(_.bind(this.exec, this));

      return this;
    };

    /**
     * Extend this class with the options passed to its instance
     */
    this.setData = function(data) {

      if (!options) return this;

      if (data && data instanceof Butter.Data) {
        this.data = data;
      } else {
        this.data = new Butter.Data(this.data);
        if (this.destroyDatasCreated) {
          this.destroyDataOnRemove = true;
        }
      }

      return this;
    };

    /**
     * Borrowed from Backbone
     * @public
     */
    this.setElement = function(el) {

      var attributes = {};
      if (el) {
        this.$el = el instanceof _.$ ? options.el : _.$(el);
      } else {
        this.$el = $('<' + this.tagName + '>');
      }

      this.el = this.$el[0];

      if (this.className) {
        attributes['class'] = this.className;
      }
      if (this.id) {
        attributes.id = this.id;
      }

      this.$el.attr(attributes);

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
        this.$el.html(_.isFunction(this.template) ? this.template(this.data.get()) : this.template);
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
      _.each(this.events, function(i, event) {
        if (this[event.name]) {
          this[event.name].onValue()();
          this[event.name] = null;
        }
      }, this);
      _.each(this.binders, function(binder) {
        binder.unbind();
      }, this);
      this.binders = [];
      return this;
    };

    /**
     * Delegate the events streams to the child nodes of this view
     * @public
     */
    this.bind = function() {
      var self = this;
      this.unbind();
      // Bind the view events
      _.each(this.events, function(event, i) {
        if (event.name) {
          this[event.name] = this.$el.asEventStream(event.type, event.el);
        } else {
          throw new Error('You must specify an event name for each event assigned to this view');
        }
      }, this);

      // Set the DOM binders parsing the view html
      _.each(binders, function(binderType) {
        var selector = this.binderSelector + binderType;
        this.$('[' + selector + ']').each(function() {
          var $el = $(this),
            binder = binders[binderType]($el, self.data, $el.attr(selector));
          self.binders.push(binder);
          binder.bind();
        });
      }, this);
      // Bind the markup binders
      //_.each(this.$('*', this.$el), this.parse, this);
      return this;
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
      if (this.$el) {
        this.$el.remove();
      }
      this.removeProperties();
    };

    // initialize this class
    return this._constructor();

  };
});