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
    'text': {
      set: function(value) {
        this.$el.text(value);
      }
    },
    /**
     * To bind the value of any text input
     * [data-val] binder
     */
    'val': {
      events: 'change',
      get: function() {
        return this.$el.val();
      },
      set: function(value) {
        this.$el.val(value);
      }
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
    var _currentStateIndex = -1;

    /**
     * @private
     */
    this._constructor = function() {

      Butter.helpers.extend(true, this, Butter.mixins);

      this.state = [];
      this.defaults = Butter.defaults.model;

      this.changes = new Bacon.Bus();
      if (Butter.helpers.isObject(data)) {
        this.set(data);
      }
    };
    /**
     * @public
     */
    this.toString = function() {
      return JSON.stringify(this.get());
    };
    /**
     * @public
     */
    this.get = function(attribute) {
      var currentState = this.state[_currentStateIndex],
        attributes;
      if (!currentState) {
        return {};
      }

      attributes = Butter.helpers.extend(true, {}, currentState.attributes);

      if (Butter.helpers.isString(attribute) && attributes[attribute]) {
        return attributes[attribute];
      } else if (!attribute) {
        return attributes;
      }
    };
    /**
     * @public
     */
    this.set = function(attributes) {

      var _attributes = this.get();

      Butter.helpers.each(attributes, function(key, value) {
        _attributes[key] = value;
      });

      this.update(_attributes, 'set');

      return this;
    };
    /**
     * @public
     */
    this.unset = function(attributes) {

      var _attributes = this.get();

      Butter.helpers.each(attributes, function(key, value) {
        if (this.attributes[key]) {
          _attributes[key] = null;
          delete _attributes[key];
        }
      }, this);

      this.update(_attributes, 'unset');

      return this;
    };
    /**
     * @public
     */
    this.update = function(attributes, method) {

      this.changes.push(attributes);

      if (~Butter.helpers.indexOf(method, ['set', 'unset'])) {

        this.state.push({
          method: method,
          attributes: attributes
        });

        if (this.state.length > this.defaults.stateMaxLength + 1) {
          this.state.shift();
        }

        _currentStateIndex = this.state.length - 1;

      }

    };
    /**
     * @public
     */
    this.listen = function(path) {
      return this.changes.map('.' + path).skipDuplicates();
    };
    /**
     * @public
     */
    this.changeToState = function(index) {
      if (this.state[index]) {
        _currentStateIndex = index;
        this.update(this.state[index].attributes, 'stateUpdate');
      }
    };
    /**
     * @public
     */
    this.undo = function() {
      console.log(_currentStateIndex);
      if (_currentStateIndex > 0) {
        this.changeToState(--_currentStateIndex);
      }
    };
    /**
     * @public
     */
    this.redo = function() {
      console.log(_currentStateIndex);
      if (_currentStateIndex < this.defaults.stateMaxLength) {
        this.changeToState(++_currentStateIndex);
      }
    };
    /**
     * @public
     */
    this.destroy = function() {
      this.changes.end();
      this.removeProperties();
    };

    this._constructor();

    return this;
  };
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

    // init
    this._constructor();

    return this;
  };
  return Butter;
}));
