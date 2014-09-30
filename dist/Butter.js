/**
 *
 * Version: 0.0.1-alpha
 * Author: Gianluca Guarini
 * Contact: gianluca.guarini@gmail.com
 * Website: http://www.gianlucaguarini.com/
 * Twitter: @gianlucaguarini
 *
 * Copyright (c) Gianluca Guarini
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
      _       _
     (_\     /_)
       ))   ((
     .-"""""""-.
 /^\/  _.   _.  \/^\
 \(   /__\ /__\   )/
  \,  \o_/_\o_/  ,/
    \    (_)    /
     `-.'==='.-'
      __) - (__
     /  `~~~`  \
    /  /     \  \
    \ :       ; /
     \|==(*)==|/
      :       :
       \  |  /
     ___)=|=(___
    {____/ \____}

 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['baconjs', 'jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    Bacon = require('baconjs');
    $ = require('jquery');
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Butter = factory(Bacon, jQuery);
  }
}(this, function(Bacon, $) {
  'use strict';
  /**
   * @module Butter
   */
  var Butter = {};
  /**
   * Default Butter default Options
   * @module Butter.defaults
   */
  Butter.defaults = {
    view: {
      binderSelector: 'data-',
      destroyModelsCreated: true
    },
    model: {
      stateMaxLength: 12
    }
  };
  /**
   * DOM data binders
   * @module Butter.binders
   */
  Butter.binders = {
    /**
     * To bind the text of any html element to the view data
     * [data-text] binder
     */
    'text': function($el, model, path) {
      return {
        set: function(value) {
          model
            .listen(path)
            .onValue($el, 'text');
        }
      };
    },
    /**
     * To bind the value of any text input
     * [data-val] binder
     */
    'val': function($el, model, path) {
      return {
        events: function() {
          var changes = $el.asEventStream('change');
          //model.changes.plug(changes.map())
        },
        get: function() {
          return $el.val();
        },
        set: function(value) {
          $el.val(value);
        }
      };
    }
  };
  /**
   * Some useful mixins
   * @module Butter.mixins
   */
  Butter.mixins = {
    /**
     * Extend the current class with adding other methods
     * @public
     */
    extend: function(properties) {
      return Butter.helpers.extend(true, this, properties);
    },
    /**
     * Executes any method of the current class only if it exists
     * @public
     */
    exec: function(callback) {
      if (typeof this[callback] === 'function') {
        this[callback].apply(this, arguments);
      }
    },
    /**
     * Remove all the class properties
     */
    removeProperties: function() {
      Butter.helpers.each(this, function(i, property) {
        this[property] = null;
        delete this[property];
      }, this);
    }
  };
  /**
   * Include some helpers to make everything smoother
   * @module Butter.helpers
   */
  Butter.helpers = {
    $: $,
    extend: $.extend,
    indexOf: $.inArray,
    each: function(iterator, callback, context) {
      return $.each(iterator, context ? Butter.helpers.bind(callback, context) : callback);
    },
    bind: $.proxy,
    isObject: function(value) {
      return $.type(value) === 'object';
    },
    isString: function(value) {
      return $.type(value) === 'string';
    },
    isFunction: function(value) {
      return $.type(value) === 'function';
    },
    isEqual: function(value1, value2) {
      return JSON.stringify(value1) === JSON.stringify(value2);
    },
    getObjectValueByPath: function(obj, path) {
      var keys, keyLen, i = 0,
        key,
        value = obj;

      keys = path && path.split('.');
      keyLen = keys && keys.length;

      while (i < keyLen && value) {
        key = keys[i];
        value = value[key];
        i++;
      }

      if (i < keyLen) {
        value = null;
      }

      return value;
    },
    setObjectValueByPath: function(obj, path, value) {
      path = path.split('.');
      for (var i = 0; i < path.length - 1; i++) {
        if (!obj[path[i]]) {
          return false;
        } else {
          obj = obj[path[i]];
        }
      }

      if (value !== null && value !== undefined) {
        obj[path[i]] = value;
        return true;
      } else {
        obj[path[i]] = null;
        delete obj[path[i]];
        return true;
      }

    }
  };
  /**
   * @module Butter.Model
   */
  Butter.Model = function(data) {
    /**
     * Private stuff
     * @private
     */
    var __currentStateIndex = 0,
      _ = Butter.helpers;

    /**
     * @private
     */
    this._constructor = function() {
      // extend this class with the default mixins used for any Butter class
      _.extend(true, this, Butter.mixins);

      // this array will contain all the data changes of this model
      // its max length is specified in the Butter.defaults.model
      this.state = [];
      // getting some useful options shared on any model class
      this.defaults = Butter.defaults.model;
      // creating the changes stream that could be listened from the outside
      this.changes = new Bacon.Bus();
      // other stream that could be listened to check all the events triggered by this model
      this.events = new Bacon.Bus();
      // set the initial data
      if (_.isObject(data)) {
        this.set(data);
      }
      return this;
    };
    /**
     * Return this model data as valid string
     * @public
     */
    this.toString = function() {
      return JSON.stringify(this.get());
    };
    /**
     * Get any value of the model by a path
     * If no path is specified we get all the model attributes
     * @param { String } path: the path to the model attribute
     * @public
     */
    this.get = function(path) {
      var currentState = this.state[__currentStateIndex];
      // check if this model has been set at least once
      // by checking its current state
      if (!currentState) {
        return {};
      } else if (_.isString(path)) {
        // get an internal property of this model
        return _.getObjectValueByPath(currentState.attributes, path);
      } else {
        // return the all model attributes by cloning them in a new object
        return _.extend(true, {}, currentState.attributes);
      }
      return this;
    };
    /**
     * Set/Update the data managed by this model
     * selecting a deep property or just using an object
     * @param { Object|String } : path to a deep value to update or object to set/update
     * @param { * } : in case of a path for a deep update here you can set the new property
     * @public
     */
    this.set = function() {

      // get all the current model attributes
      var attributes = this.get(),
        // assuming we don't need to update this
        mustUpdate = false;

      // do we need to update a deep property?
      if (_.isString(arguments[0])) {
        // update the deep value or return false
        mustUpdate = _.setObjectValueByPath(attributes, arguments[0], arguments[1]);
      } else {
        // update or add new values
        _.each(arguments[0], function(key, value) {
          attributes[key] = value;
        });
        mustUpdate = true;
      }

      // trigger the update function only if it's really needed
      if (mustUpdate) {
        this.update(attributes, 'set');
      }

      return this;
    };
    /**
     * Remove any property from the current model
     * @param { String } path: path to the value to remove
     * @public
     */
    this.unset = function(path) {

      var attributes = this.get();
      // update only if the nested property has been found
      if (path && _.setObjectValueByPath(attributes, path, null)) {
        this.update(attributes, 'unset');
      }

      return this;
    };
    /**
     * Reset th
     * @return {[type]} [description]
     */
    this.reset = function() {
      this.update({}, 'reset');

      return this;
    };
    /**
     * Update this model attributes
     * @param { Object } attributes: new data to set
     * @public
     */
    this.update = function(attributes, method) {

      this.changes.push(attributes);
      this.events.push(method);

      if (~_.indexOf(method, ['set', 'unset', 'reset'])) {

        this.state.push({
          method: method,
          attributes: attributes
        });

        if (this.state.length > this.defaults.stateMaxLength + 1) {
          this.state.shift();
        }
        __currentStateIndex = this.state.length - 1;

      }

    };
    /**
     * @public
     */
    this.listen = function(path) {
      return this.changes.map('.' + path).skipDuplicates(_.isEqual);
    };
    /**
     * @public
     */
    this.changeToState = function(index, method) {
      if (this.state[index]) {
        __currentStateIndex = index;
        this.update(this.state[index].attributes, method);
      }
    };
    /**
     * @public
     */
    this.undo = function() {
      if (__currentStateIndex > 0) {
        this.changeToState(--__currentStateIndex, 'undo');
      }
    };
    /**
     * @public
     */
    this.redo = function() {
      if (__currentStateIndex < this.defaults.stateMaxLength) {
        this.changeToState(++__currentStateIndex, 'redo');
      }
    };
    /**
     * @public
     */
    this.destroy = function() {
      this.changes.end();
      this.events.end();
      this.removeProperties();
    };

    // initialize this class
    return this._constructor();

  };
  /**
   * @module Butter.View
   */
  Butter.View = function(options) {

    var _ = Butter.helpers;
    /**
     * Initialize this class with the options passed to it
     * @private
     */
    this._constructor = function() {

      _.extend(true, this, Butter.mixins);

      this.bindings = [];
      this.views = [];
      this.template = options.template;
      this.destroyModelOnRemove = false;
      // Special property representing the state of the current view
      this.state = new Bacon.Bus();
      this.defaults = Butter.defaults.view;

      // Extend this view with some other custom events passed via options
      _.each(options, function(key, value) {
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
      if (this.destroyModelOnRemove) {
        this.model.destroy();
      }
      this.$el.remove();
      this.removeProperties();
    };

    // initialize this class
    return this._constructor();

  };
  return Butter;
}));
