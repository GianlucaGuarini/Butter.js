/**
 * Butter.js
 * Version: 0.0.1-alpha.2
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
    module.exports = factory(require('baconjs'), require('jquery'));
  } else {
    // Browser globals (root is window)
    root.Butter = factory(Bacon, jQuery);
  }
}(this, function(Bacon, $) {
  var utils_helpers, utils_defaults, utils_mixins, utils_binders, Data, View, Butter, exports;
  utils_helpers = exports = function(exports) {
    var _toString = Object.prototype.toString,
      _indexOf = Array.prototype.indexOf,
      _each = Array.prototype.forEach;
    exports = {
      $: $,
      isBoolean: function(value) {
        return typeof value === 'boolean';
      },
      isObject: function(value) {
        return _toString.call(value) === '[object Object]';
      },
      isString: function(value) {
        return typeof value === 'string';
      },
      isArray: function(value) {
        return _toString.call(value) === '[object Array]';
      },
      isFunction: function(value) {
        return typeof value === 'function';
      },
      isUndefined: function(value) {
        return typeof value === 'undefined';
      },
      extend: function(destination, source) {
        for (var property in source) {
          destination[property] = source[property];
        }
        return this.clone(destination);
      },
      clone: function(obj) {
        if (obj) {
          return JSON.parse(JSON.stringify(obj));
        } else {
          return {};
        }
      },
      indexOf: function(element, array) {
        if (_indexOf) {
          return _indexOf.call(array, element);
        } else {
          return $.inArray(element, array);
        }
      },
      each: function(iterator, callback, context) {
        var self = this;
        if (_each) {
          return _each.call(iterator, context ? this.bind(callback, context) : callback);
        } else {
          return $.each(iterator, function(i, elm) {
            if (context) {
              self.bind(callback, context, elm, i);
            } else {
              callback(elm, i);
            }
          });
        }
      },
      bind: function(f, c) {
        return function() {
          return f.apply(c, arguments);
        };
      },
      isEqual: function(value1, value2) {
        return JSON.stringify(value1) === JSON.stringify(value2);
      },
      getObjectValueByPath: function(obj, path) {
        var keys, keyLen, i = 0,
          key, value = obj;
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
    return exports;
  }({});
  utils_defaults = function(exports) {

    /**
     * @module Butter.defaults
     */
    exports = {
      view: {
        binderSelector: 'data-',
        destroyModelsCreated: true
      },
      data: {
        maxStatesLength: 10
      }
    };
    return exports;
  }({});
  utils_mixins = function(exports) {

    var _ = utils_helpers;
    /**
     * @module Butter.mixins
     */
    exports = {
      extend: function(properties) {
        return _.extend(this, properties);
      },
      exec: function(callback) {
        if (typeof this[callback] === 'function') {
          this[callback].apply(this, arguments);
        }
      },
      removeProperties: function() {
        _.each(this, function(i, property) {
          this[property] = null;
          delete this[property];
        }, this);
      }
    };
    return exports;
  }({});
  utils_binders = function(exports) {

    exports = {
      'text': function($el, data, path) {
        return {
          set: function(value) {
            data.listen(path).onValue($el, 'text');
          }
        };
      },
      'val': function($el, data, path) {
        return {
          events: function() {
            var changes = $el.asEventStream('change');
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
    return exports;
  }({});
  Data = function(exports) {

    var _ = utils_helpers,
      defaults = utils_defaults,
      mixins = utils_mixins;
    exports = function(initialValues) {
      var __currentStateIndex = 0,
        __initialValues = null;
      this._constructor = function() {
        _.extend(this, mixins);
        _.extend(this, defaults.data);
        this.state = [];
        this.changes = new Bacon.Bus();
        this.events = new Bacon.Bus();
        if (_.isObject(initialValues) || _.isArray(initialValues)) {
          this.set(initialValues);
          __initialValues = this.get();
        }
        return this;
      };
      this._changeToState = function(index, method) {
        if (this.state[index]) {
          __currentStateIndex = index;
          this.update(this.state[index].attributes, method);
        }
      };
      this.toString = function() {
        return JSON.stringify(this.get());
      };
      this.get = function(path) {
        var currentState = this.state[__currentStateIndex];
        if (!currentState) {
          return {};
        } else if (_.isString(path)) {
          return _.getObjectValueByPath(currentState.attributes, path);
        } else {
          return _.clone(currentState.attributes);
        }
      };
      this.set = function() {
        var attributes = this.get(),
          mustUpdate = false;
        if (_.isString(arguments[0])) {
          mustUpdate = _.setObjectValueByPath(attributes, arguments[0], arguments[1]);
        } else {
          _.extend(attributes, arguments[0]);
          mustUpdate = true;
        }
        if (mustUpdate) {
          this.update(attributes, 'set');
        }
        return this;
      };
      this.unset = function(path) {
        var attributes = this.get();
        if (path && _.setObjectValueByPath(attributes, path, null)) {
          this.update(attributes, 'unset');
        }
        return this;
      };
      this.reset = function() {
        this.update(__initialValues, 'reset');
        return this;
      };
      this.update = function(attributes, method) {
        this.changes.push(attributes);
        this.events.push(method);
        if (~_.indexOf(method, [
          'set',
          'unset',
          'reset'
        ])) {
          this.state.push({
            method: method,
            attributes: attributes
          });
          if (this.state.length > this.maxStatesLength + 1) {
            this.state.shift();
          }
          __currentStateIndex = this.state.length - 1;
        }
      };
      this.bind = function(destination, sourcePath, destinationPath, doubleWay) {
        var _doubleWay = _.isUndefined(doubleWay) ? true : doubleWay;
        var updateData = function(value) {
          if (destinationPath) {
            destination.set(destinationPath, value);
          } else {
            destination.set(value);
          }
        };
        if (sourcePath) {
          this.listen(sourcePath).onValue(updateData);
        } else {
          this.changes.skipDuplicates(_.isEqual).onValue(updateData);
        }
        if (_doubleWay) {
          destination.bind(this, destinationPath, sourcePath, false);
        }
      };
      this.listen = function(path) {
        return this.changes.map('.' + path).skipDuplicates(_.isEqual);
      };
      this.undo = function() {
        if (__currentStateIndex > 0) {
          this._changeToState(--__currentStateIndex, 'undo');
        }
      };
      this.redo = function() {
        if (__currentStateIndex < this.maxStatesLength) {
          this._changeToState(++__currentStateIndex, 'redo');
        }
      };
      this.destroy = function() {
        this.changes.end();
        this.events.end();
        this.removeProperties();
      };
      return this._constructor();
    };
    return exports;
  }({});
  View = function(exports) {

    var _ = utils_helpers,
      defaults = utils_defaults,
      mixins = utils_mixins;
    exports = function(options) {
      this._constructor = function() {
        _.extend(this, mixins);
        _.extend(this, defaults.view);
        this.bindings = [];
        this.views = [];
        this.template = options.template;
        this.destroyDataOnRemove = false;
        this.state = new Bacon.Bus();
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
      this.setElement = function(el) {
        this.$el = el instanceof _.$ ? options.el : _.$(el);
        this.el = this.$el[0];
        if (!this.el) {
          console.warn(options.el + 'was not found!');
        }
        return this;
      };
      this.$ = function(selector) {
        return _.$(selector, this.$el);
      };
      this.render = function() {
        this.state.push('beforeRender');
        if (this.template) {
          this.$el.html(this.template);
        }
        this.bind().state.push('afterRender');
        return this;
      };
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
      this.bind = function() {
        this.unbind();
        _.each(options.events, function(event, i) {
          this[event.name] = this.$el.asEventStream(event.type, event.el);
        }, this);
        return this;
      };
      this.parse = function(i, el) {};
      this.remove = function() {
        this.state.push('beforeRemove');
        this.state.end();
        if (this.destroyDataOnRemove) {
          this.model.destroy();
        }
        this.$el.remove();
        this.removeProperties();
      };
      return this._constructor();
    };
    return exports;
  }({});
  Butter = function(exports) {

    exports = {
      helpers: utils_helpers,
      defaults: utils_defaults,
      mixins: utils_mixins,
      binders: utils_binders,
      Data: Data,
      View: View
    };
    return exports;
  }({});
  return Butter;
}));
