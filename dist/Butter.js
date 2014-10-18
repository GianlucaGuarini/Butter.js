/**
 * Butter.js
 * Version: 0.0.1-alpha.4
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
      _keys = Object.keys,
      _indexOf = Array.prototype.indexOf,
      _each = Array.prototype.forEach,
      _parseObjectByPath = function(object, path) {
        var keyLength, i = 0,
          key;
        path = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.');
        keyLength = path && path.length;
        while (i < keyLength - 1) {
          key = path[i];
          object = object[key];
          i++;
        }
        return {
          pathArray: path,
          lastKey: path[path.length - 1],
          value: object
        };
      };
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
      isEmpty: function(value) {
        if (this.isObject) {
          return JSON.stringify(value).length === 2;
        } else {
          return value.length === 0;
        }
      },
      difference: function(value1, value2, recursive) {
        var self = this,
          result = false;
        if (!this.isEqual(value1, value2)) {
          result = value1;
          if (this.isArray(value1)) {
            result = [];
            this.each(value1, function(value) {
              if (!self.contains(value2, value)) {
                result.push(value);
              }
            });
          } else if (this.isObject(value1)) {
            result = {};
            this.each(value1, function(key, value) {
              if (!value2[key]) {
                result[key] = value;
              }
            });
          }
        }
        return result;
      },
      clone: function(obj) {
        if (obj) {
          return JSON.parse(JSON.stringify(obj));
        } else {
          return {};
        }
      },
      contains: function(array, value) {
        return !!~this.indexOf(array, value);
      },
      indexOf: function(array, value) {
        var result = -1,
          i = 0,
          arrayLength = array.length;
        if (this.isObject(value)) {
          for (; i < arrayLength; i++) {
            if (this.isEqual(array[i], value)) {
              result = array[i];
              break;
            }
          }
          return result;
        } else {
          if (_indexOf) {
            return _indexOf.call(array, value);
          } else {
            return Bacon._.indexOf(array, value);
          }
        }
      },
      each: function(iterator, callback, context) {
        var self = this;
        context = context ? this.bind(callback, context) : callback.prototype;
        if (_each && _keys) {
          if (this.isObject(iterator)) {
            _each.call(_keys(iterator), function(key) {
              callback.apply(context, [
                key,
                iterator[key]
              ]);
            });
          } else {
            return _each.apply(iterator, context);
          }
        } else {
          return $.each(iterator, function(i, element) {
            callback.apply(context, [
              element,
              i
            ]);
          });
        }
      },
      bind: function(func, context) {
        return function() {
          return func.apply(context, arguments);
        };
      },
      isEqual: function(value1, value2) {
        return JSON.stringify(value1) === JSON.stringify(value2);
      },
      getObjectValueByPath: function(object, path) {
        var result = _parseObjectByPath(object, path);
        return result.value[result.lastKey];
      },
      setObjectValueByPath: function(object, path, value) {
        var result = _parseObjectByPath(object, path);
        if (value !== null && value !== undefined) {
          result.value[result.lastKey] = value;
          return result.value;
        } else {
          result.value[result.lastKey] = null;
          delete result.value[result.lastKey];
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
        maxStatesLength: 10,
        emulateHTTP: true
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
        this.isNew = true;
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
        return this;
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
      this.parse = function(data) {
        return data;
      };
      this.validate = function(data) {
        return true;
      };
      this.changedAttributes = function() {
        if (this.maxStatesLength > 2 && __currentStateIndex) {
          return _.difference(this.state[__currentStateIndex - 1].attributes, this.get());
        } else {
          return this.get();
        }
      };
      this.sync = function(method, options) {
        var httpVerb, ajax, data;
        options = options || {};
        if (!this.url) {
          throw new Error('This class instance doesn\'t have any url, it cannot be synched');
        }
        switch (method) {
          case 'save':
            if (this.isNew) {
              method = 'create';
              httpVerb = 'POST';
            } else {
              method = 'update';
              if (options.patch) {
                httpVerb = 'PATCH';
              } else {
                httpVerb = 'PUT';
              }
            }
            break;
          case 'delete':
            httpVerb = 'DELETE';
            break;
          default:
            method = 'read';
            httpVerb = 'GET';
        }
        if (httpVerb === 'PATCH') {
          data = this.changedAttributes();
        } else if (httpVerb !== 'GET') {
          data = this.get();
        }
        if (this.emulateHTTP && data) {
          data = _.extend({
            _method: httpVerb
          }, data);
        }
        this.isNew = false;
        ajax = $.ajax(_.extend({
          url: this.url,
          type: this.emulateHTTP ? httpVerb === 'GET' ? 'GET' : 'POST' : httpVerb,
          data: httpVerb === 'GET' ? null : JSON.stringify(data),
          dataType: 'json'
        }, options));
        ajax.then(_.bind(function(data) {
          if (httpVerb === 'GET') {
            this.update(data, 'read');
          } else {
            this.events.push(method);
          }
        }, this), _.bind(this.events.error, this), _.bind(this.events.push, this, 'sync'));
        return ajax;
      };
      this.fetch = function(options) {
        return this.sync('read', options);
      };
      this.save = function(options) {
        return this.sync('save', options);
      };
      this.set = function() {
        var attributes = this.get(),
          mustUpdate = false;
        if (_.isString(arguments[0])) {
          mustUpdate = _.setObjectValueByPath(attributes, arguments[0], arguments[1]);
        } else {
          if (_.isObject(attributes)) {
            _.extend(attributes, arguments[0]);
          } else {
            attributes = arguments[0];
          }
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
      this.add = function(item, path, at) {
        var array = _.isString(path) ? this.get(path) : this.get();
        if (!_.isArray(array)) {
          throw new Error('You cannot push new data in an element that is not an array');
        } else {
          array.splice(at || array.length, 0, item);
          if (path) {
            this.set(path, array);
          } else {
            this.update(array, 'add');
          }
        }
        return this;
      };
      this.remove = function(item, path) {
        var array = _.isString(path) ? this.get(path) : this.get(),
          itemIndex;
        if (!_.isArray(array)) {
          throw new Error('You cannot remove data from an element that is not an array');
        } else {
          itemIndex = _.indexOf(item, array);
          if (!~itemIndex)
            throw new Error(JSON.stringify(item) + ' was not found in this array');
          array = array.splice(itemIndex, 1);
          if (path) {
            this.set(path, array);
          } else {
            this.update(array, 'remove');
          }
        }
        return this;
      };
      this.update = function(attributes, method) {
        var validation = this.validate(attributes);
        if (validation !== true) {
          this.events.error(validation);
          return false;
        }
        attributes = this.parse(attributes);
        this.changes.push(attributes);
        if (_.contains([
            'set',
            'unset',
            'reset',
            'read',
            'add',
            'remove'
          ], method)) {
          this.state.push({
            method: method,
            attributes: attributes
          });
          if (this.state.length > this.maxStatesLength + 1) {
            this.state.shift();
          }
          __currentStateIndex = this.state.length - 1;
        }
        this.events.push(method);
        return this;
      };
      this.clone = function() {
        return new Butter.Data(this.get()).extend(this);
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
        return this;
      };
      this.listen = function(path) {
        return this.changes.map('.' + path).skipDuplicates(_.isEqual);
      };
      this.on = function(method) {
        return this.events.filter(function(event) {
          return _.contains(method.split(' '), event);
        }).skipDuplicates();
      };
      this.undo = function() {
        if (__currentStateIndex > 0) {
          this._changeToState(--__currentStateIndex, 'undo');
        }
        return this;
      };
      this.redo = function() {
        if (__currentStateIndex < this.maxStatesLength) {
          this._changeToState(++__currentStateIndex, 'redo');
        }
        return this;
      };
      this.destroy = function(options) {
        var requestStream, onModelDestroyed = _.bind(function() {
          this.changes.end();
          this.events.end();
          this.removeProperties();
        }, this);
        if (this.url && !this.isNew) {
          this.sync('delete', options).done(onModelDestroyed);
        } else {
          onModelDestroyed();
        }
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
