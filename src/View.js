define(function(require, exports, module) {
  'use strict';
  /**
   * @module Butter.View
   */
  var _ = require('./utils/helpers'),
    _binders = require('./utils/binders'),
    _defaults = require('./utils/defaults'),
    _mixins = require('./utils/mixins'),
    View = function(options) {

      this.options = options;
      this.destroyDataOnRemove = false;

      this.events = [];
      this.callbacks = [];
      this.binders = [];
      this.subviews = [];
      // extend this class with the default mixins used for any Butter class
      _.extend(this, _mixins);
      // getting some useful options shared between any view class
      _.extend(this, _defaults.view);
      // extend this view with the options passed to its instance
      _.extend(this, options || {});

      // Special property representing the state of the current view
      this.state = new Bacon.Bus();

      this.setData(this.data);
      this.setElement(this.el);

      this.state.onValue(_.bind(this.exec, this));

      return this;
    };

  View.prototype = {
    constructor: View,
    /**
     * Extend this class with the options passed to its instance
     */
    setData: function(data) {

      if (!this.options) return this;

      if (data && data instanceof Butter.Data) {
        this.data = data;
      } else {
        this.data = new Butter.Data(this.data);
        if (this.destroyDatasCreated) {
          this.destroyDataOnRemove = true;
        }
      }

      return this;
    },

    /**
     * Borrowed from Backbone
     * @public
     */
    setElement: function(el) {

      var attributes = {};
      if (el) {
        this.$el = el instanceof _.$ ? this.options.el : _.$(el);
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
    },

    /**
     * Select any element in this view
     * @public
     */
    $: function(selector) {
      return _.$(selector, this.$el);
    },
    /**
     * Render the markup and bind the model to the DOM
     * @public
     */
    render: function() {

      this.state.push('beforeRender');

      if (this.template) {

        if (_.isString(this.template)) {
          // get the template html
          this.template = this.fetchTemplate(this.template);
        }

        this.$el.html(_.isFunction(this.template) ? this.template(this.data.get()) : this.template);
      }

      // block the data bindings
      this.bind();


      // loop and render the subviews
      if (_.isArray(this.views)) {
        this.insertSubviews(this.views);
      }

      this.state.push('afterRender');

      return this;
    },
    /**
     * Render all the subviews
     * @public
     * @param  { String } selector: DOM query selector where we will inject the subview
     * @param  { Object } subview: Butter.View instance
     */
    insertSubviews: function(subviews) {


      _.each(subviews, function(subviewObj) {

        var selector = _.keys(subviewObj)[0],
          subview = subviewObj[selector];

        if (selector) {
          this.setSubview(selector, subview);
        } else {
          this.insertSubview(subview);
        }

        subview.render();

      }, this);

      return this;
    },
    insertSubview: function(subview) {

      this.subviews.push(subview);

      this.insert(subview.$el);

      return subview;
    },
    /**
     * Render a subview injecting it into its wrapper
     * @param  { String } selector: DOM query selector where we want inject the subview
     * @param  { Object } subview: Butter.View instance
     */
    setSubview: function(selector, subview) {
      var $wrapper = this.$(selector);

      if (!$wrapper.length) {
        throw new Error('no element found with the ' + selector + ' selector');
      }

      this.subviews.push(subview);

      $wrapper.append(subview.$el);

      return subview;
    },
    /**
     * Remove all the events from the child nodes
     * @public
     */
    unbind: function() {
      this.$el.off();

      // End the events streams
      _.each(this.events, function(i, event) {
        if (this[event.name]) {
          this[event.name].onValue()();
          this[event.name] = null;
        }
      }, this);

      // End the callbacks stream
      _.each(this.callbacks, function(callback) {
        callback();
      });

      _.each(this.subviews, function(subview) {
        subview.unbind();
      });

      // Kill all the data bindings
      _.each(this.binders, function(binder) {
        binder();
      }, this);

      this.binders = [];

      return this;
    },

    /**
     * Return an events stream filtering only some of the state triggered by this view
     * @public
     */

    on: function(method) {
      return this.state.filter(function(event) {
        return (_.contains(method.split(' '), event));
      }).skipDuplicates();
    },

    /**
     * This view eventually could scope its binders to a specific path of the Data instance
     * @type {String}
     */
    bindingPath: '',
    /**
     * This string will hold a string that will be replaced by the binding path
     * @type {String}
     */
    placeholderPath: '',

    /**
     * Delegate the events streams to the child nodes of this view
     * @public
     */
    bind: function() {
      var self = this,
        defeferredBinders = [];

      this.unbind();

      // bind all the subviews
      _.each(this.subviews, function(subview) {
        subview.bind();
      });

      // Bind the view events
      _.each(this.events, function(event, i) {
        if (event.name) {
          this[event.name] = this.$el.asEventStream(event.type, event.el);
          if (this.methods[event.name] && _.isFunction(this.methods[event.name])) {
            this.callbacks.push(this[event.name].onValue(_.bind(this.methods[event.name], this)));
          }
        } else {
          throw new Error('You must specify an event name for each event assigned to this view');
        }
      }, this);

      // Set the DOM binders parsing the view html
      _.each(_binders, function(binderType) {

        var selector = this.binderSelector + binderType,
          createBinder = function(pathAttribute) {
            var $el = $(this),
              path = pathAttribute || $el.attr(selector),
              binder;
            // replace the placeholder paths with the correct ones
            if (self.placeholderPath && self.bindingPath) {
              path = path.replace(self.placeholderPath, self.bindingPath);
            }

            if (!path) {
              throw new Error('The path to the data values is missing on the element ' + this);
            }

            // Clean up the string
            // here could really come anything
            // let's be sure we remove the shit from here
            path = path.replace(/[\n\r]+/g, '')
              .replace(/^\s\s*/, '')
              .replace(/\s\s*$/, '');

            binder = _binders[binderType]($el, self.data, path);

            if (!binder.deferred) {
              binder.bind();
            } else {
              defeferredBinders.push(binder);
            }

            self.binders.push(binder.unbind);

          };

        this.$('[' + selector + ']').each(createBinder);

        // Check also the view el binders
        var viewElementAttribute = this.$el.attr(selector);
        // if this.$el has also the binder attribute
        if (viewElementAttribute) {
          // we bind it
          createBinder.call(this.el, viewElementAttribute);
        }

      }, this);

      _.each(defeferredBinders, function(binder) {
        binder.bind();
      });



      return this;
    },
    /**
     * Remove this view its subViews and all the events
     */
    remove: function() {
      this.state.push('beforeRemove');
      this.state.end();
      this.unbind();
      /**
       *  Destroy the model created with this view because we assume it's not shared with other views
       */
      if (this.destroyDataOnRemove) {
        this.data.destroy();
      }

      _.each(this.subviews, function(subview) {
        subview.remove();
      }, this);

      if (this.$el) {
        this.$el.remove();
      }

      this.removeProperties();
    }
  };

  module.exports = View;

});