/**
 * Butter.js
 * Version: 0.0.1-alpha.7
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
    define(['baconjs', 'jquery'], function(Bacon, jQuery) {
      // Also create a global in case some scripts
      // that are loaded still are looking for
      // a global even when an AMD loader is in use.
      return (root.Butter = factory(Bacon, jQuery));
    });
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
  var utils_helpers, utils_defaults, utils_mixins, utils_binders, Butter, _Data_, _View_, exports;
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
          if (!object[key])
            return;
          object = object[key];
          i++;
        }
        return {
          pathArray: path,
          lastKey: path[path.length - 1],
          value: object
        };
      };
    var helpers = {
      $: $,
      isBoolean: function(value) {
        return typeof value === 'boolean';
      },
      isObject: function(value) {
        return _toString.call(value) === '[object Object]' && !helpers.isUndefined(value);
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
      isEqual: function(value1, value2) {
        return JSON.stringify(value1) === JSON.stringify(value2);
      },
      isEmpty: function(value) {
        if (helpers.isObject) {
          return JSON.stringify(value).length === 2;
        } else {
          return value.length === 0;
        }
      },
      extend: function(destination, source) {
        for (var property in source) {
          destination[property] = source[property];
        }
        return destination;
      },
      difference: function(value1, value2, recursive) {
        var self = this,
          result = false;
        if (!helpers.isEqual(value1, value2)) {
          result = value1;
          if (helpers.isArray(value1)) {
            result = [];
            helpers.each(value1, function(value) {
              if (!self.contains(value2, value)) {
                result.push(value);
              }
            });
          } else if (helpers.isObject(value1)) {
            result = {};
            helpers.each(value1, function(key, value) {
              if (!value2[key]) {
                result[key] = value;
              }
            });
          }
        }
        return result;
      },
      clone: function(element) {
        if (helpers.isArray(element) || helpers.isObject(element)) {
          return JSON.parse(JSON.stringify(element));
        } else {
          return element;
        }
      },
      contains: function(array, value) {
        return !!~helpers.indexOf(array, value);
      },
      indexOf: function(array, value) {
        var result = -1,
          i = 0,
          arrayLength = array.length;
        if (helpers.isObject(value)) {
          for (; i < arrayLength; i++) {
            if (helpers.isEqual(array[i], value)) {
              result = i;
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
        var self = this,
          isObject = helpers.isObject(iterator);
        context = context || callback.prototype;
        if (!iterator)
          return;
        if (_each && _keys) {
          if (isObject) {
            _each.call(_keys(iterator), function(key) {
              callback.apply(context, [
                key,
                iterator[key]
              ]);
            });
          } else {
            _each.call(iterator, helpers.bind(callback, context));
          }
        } else {
          $.each(iterator, function(i, element) {
            callback.apply(context, isObject ? [
              i,
              element
            ] : [
              element,
              i
            ]);
          });
        }
      },
      keys: _keys || function(obj) {
        var keys = [];
        for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            keys.push(obj[prop]);
          }
        }
        return keys;
      },
      bind: function(func, context) {
        return function() {
          return func.apply(context, arguments);
        };
      },
      getObjectValueByPath: function(object, path) {
        var result = _parseObjectByPath(object, path);
        if (!result || !result.value)
          return;
        return result.value[result.lastKey];
      },
      setObjectValueByPath: function(object, path, value) {
        var result = _parseObjectByPath(object, path);
        if (!result || !result.value)
          return;
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
    exports = helpers;
    return exports;
  }({});
  utils_defaults = function(exports) {

    /**
     * @module Butter.defaults
     */
    exports = {
      view: {
        binderSelector: 'data-',
        destroyDatasCreated: true,
        tagName: 'div',
        id: null,
        className: null,
        fetchTemplate: function(template) {
          return $(template).html();
        },
        insert: function($el) {
          this.$el.append($el);
        }
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
    exports = {
      extend: function(properties) {
        _.extend(this, properties);
        return this;
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

    var _ = utils_helpers,
      _killListeners = function(listeners) {
        _.each(listeners, function(listener) {
          listener();
        });
      };
    exports = {
      'each': function($el, data, path) {
        $el.removeAttr(Butter.defaults.view.binderSelector + 'each');
        var pathSplit = path.split(/\s+as\s+/gi),
          subviews = [],
          dataPath = pathSplit[0],
          placeholderPath = pathSplit[1],
          $parent = $el.parent(),
          $template = $el.clone().removeAttr(Butter.defaults.view.binderSelector + 'each');
        $el.remove();
        return {
          deferred: true,
          addSubview: function(attributes, i) {
            var $newEl = $template.clone(),
              newView;
            newView = new Butter.View({
              el: $newEl,
              data: data,
              placeholderPath: placeholderPath,
              bindingPath: dataPath + '.' + i
            });
            subviews.push(newView);
            newView.bind();
            return newView;
          },
          get: function() {},
          set: function() {
            var html = [];
            _.each(data.get(dataPath), function() {
              html.push(this.addSubview.apply(this, arguments).$el);
            }, this);
            $parent.append(html);
            html = null;
            data.listen(dataPath).debounce(50).onValue(_.bind(function(values) {
              var itemsCount = subviews.length - values.length;
              if (!itemsCount) {
                return;
              } else if (itemsCount > 0) {
                while (itemsCount--) {
                  subviews[subviews.length - 1].remove();
                  subviews.splice(subviews.length - 1, 1);
                }
              } else {
                html = [];
                while (itemsCount++ < 0) {
                  var i = values.length + itemsCount - 1;
                  html.push(this.addSubview(values[i], i).$el);
                }
                $parent.append(html);
              }
            }, this));
          },
          bind: function() {
            this.set();
            this.get();
          },
          unbind: function() {
            _.each(subviews, function(subview) {
              subview.remove();
            });
            subviews = null;
            $el.attr(Butter.defaults.view.binderSelector + 'each', path);
            $parent.append($el);
          }
        };
      },
      show: function($el, data, path, inverse) {
        var listener;
        return {
          deferred: true,
          get: function() {
            var onChange = function(value) {
              if (value) {
                $el[inverse ? 'hide' : 'show']();
              } else {
                $el[inverse ? 'show' : 'hide']();
              }
            };
            listener = data.listen(path).debounce(50).onValue(onChange);
            onChange(data.get(path));
          },
          bind: function() {
            this.get();
          },
          unbind: function() {
            listener();
          }
        };
      },
      hide: function($el, data, path) {
        return this.show($el, data, path, true);
      },
      css: function($el, data, path) {
        var cssRules = path.split(/\s+(?:&&|and)\s+/gi),
          listeners = [];
        return {
          set: function() {
            _.each(cssRules, function(cssRulePath) {
              var pathSplit = cssRulePath.split(/\s+as\s+/gi);
              listeners.push(data.listen(pathSplit[0]).startWith(data.get(pathSplit[0])).assign($el, 'css', pathSplit[1]));
            });
          },
          bind: function() {
            this.set();
          },
          unbind: function() {
            _killListeners(listeners);
          }
        };
      },
      'text': function($el, data, path) {
        var listener;
        return {
          set: function() {
            listener = data.listen(path).debounce(50).startWith(data.get(path)).onValue($el, 'text');
          },
          bind: function() {
            this.set();
          },
          unbind: function() {
            listener();
          }
        };
      },
      'value': function($el, data, path) {
        var listeners = [],
          events = $el.asEventStream('input change copy paste');
        return {
          get: function() {
            listeners.push(events.map(function() {
              return $el.val();
            }).debounce(50).assign(data, 'set', path));
          },
          set: function() {
            listeners.push(data.listen(path).startWith(data.get(path)).assign($el, 'val'));
          },
          bind: function() {
            this.set();
            this.get();
          },
          unbind: function() {
            _killListeners(listeners);
          }
        };
      }
    };
    return exports;
  }({});
  _Data_ = function(exports) {

    var _ = utils_helpers,
      _defaults = utils_defaults,
      _mixins = utils_mixins,
      Data = function(initialValues) {
        this.__initialValues = initialValues;
        this.__currentStateIndex = 0;
        _.extend(this, _mixins);
        _.extend(this, _defaults.data);
        this.state = [];
        this.changes = new Bacon.Bus();
        this.events = new Bacon.Bus();
        this.isNew = true;
        if (!_.isUndefined(initialValues)) {
          this.set(initialValues);
        }
        return this;
      };
    Data.prototype = {
      constructor: Data,
      _changeToState: function(index, method) {
        if (this.state[index]) {
          this.__currentStateIndex = index;
          this.update(this.state[index].attributes, method);
        }
        return this;
      },
      toString: function() {
        return JSON.stringify(this.toJSON());
      },
      toJSON: function() {
        return this.get();
      },
      get: function(path) {
        var currentState = this.state[this.__currentStateIndex],
          attributes;
        if (_.isUndefined(currentState)) {
          attributes = undefined;
        } else if (_.isString(path)) {
          attributes = _.getObjectValueByPath(currentState.attributes, path);
        } else if (_.isObject(currentState.attributes) || _.isArray(currentState.attributes)) {
          attributes = currentState.attributes;
        } else {
          attributes = currentState.attributes;
        }
        return _.clone(attributes);
      },
      parse: function(data) {
        return data;
      },
      validate: function(data) {
        return true;
      },
      changedAttributes: function() {
        if (this.maxStatesLength > 2 && this.__currentStateIndex) {
          return _.difference(this.state[this.__currentStateIndex - 1].attributes, this.get());
        } else {
          return this.get();
        }
      },
      sync: function(method, options) {
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
        ajax.always(_.bind(this.events.push, this, 'sync'));
        ajax.then(_.bind(function(data) {
          if (httpVerb === 'GET') {
            this.update(data, 'read');
          } else {
            this.events.push(method);
          }
        }, this), _.bind(this.events.error, this));
        return ajax;
      },
      fetch: function(options) {
        return this.sync('read', options);
      },
      save: function(options) {
        return this.sync('save', options);
      },
      set: function() {
        var args = arguments,
          attributes = this.toJSON(),
          mustUpdate = false;
        if (args.length === 2 && _.isString(args[0]) && args[1]) {
          mustUpdate = _.setObjectValueByPath(attributes, args[0], args[1]);
        } else {
          if (_.isObject(attributes)) {
            _.extend(attributes, args[0]);
          } else {
            attributes = args[0];
          }
          mustUpdate = true;
        }
        if (mustUpdate) {
          this.update(attributes, 'set');
        }
        return this;
      },
      unset: function(path) {
        var attributes = this.get();
        if (path) {
          _.setObjectValueByPath(attributes, path, null);
        } else {
          attributes = undefined;
        }
        this.update(attributes, 'unset');
        return this;
      },
      reset: function() {
        this.update(this.__initialValues, 'reset');
        return this;
      },
      add: function(item, path, at) {
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
      },
      remove: function(item, path) {
        var array = _.isString(path) ? this.get(path) : this.get(),
          itemIndex;
        if (!_.isArray(array)) {
          throw new Error('You cannot remove data from an element that is not an array');
        } else {
          itemIndex = _.indexOf(array, item);
          if (!~itemIndex)
            throw new Error(JSON.stringify(item) + ' was not found in this array');
          array.splice(itemIndex, 1);
          if (path) {
            this.set(path, array);
          } else {
            this.update(array, 'remove');
          }
        }
        return this;
      },
      update: function(attributes, method) {
        var validation = this.validate(attributes);
        if (validation !== true) {
          this.events.error(validation);
          return false;
        }
        attributes = this.parse(attributes);
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
          this.__currentStateIndex = this.state.length - 1;
          if (_.isArray(attributes)) {
            this.length = attributes.length;
          }
        }
        this.changes.push(attributes);
        this.events.push(method);
        this.attributes = attributes;
        return this;
      },
      clone: function() {
        return new Butter.Data(this.get()).extend(this);
      },
      bind: function(destination, sourcePath, destinationPath, doubleWay) {
        var self = this,
          _doubleWay = _.isUndefined(doubleWay) ? true : doubleWay;
        if (_doubleWay) {
          destination.listen(destinationPath).onValue(function(value) {
            self.set.apply(self, sourcePath ? [
              sourcePath,
              value
            ] : [value]);
          });
        }
        this.listen(sourcePath).onValue(function(value) {
          destination.set.apply(destination, destinationPath ? [
            destinationPath,
            value
          ] : [value]);
        });
        return this;
      },
      listen: function(path) {
        var initialValue, stream;
        if (path) {
          initialValue = this.get(path);
          stream = this.changes.map('.' + path);
        } else {
          initialValue = this.get();
          stream = this.changes;
        }
        return stream.startWith(initialValue).skipWhile(function(value) {
          return _.isEqual(value, initialValue);
        }).skipDuplicates(_.isEqual);
      },
      on: function(method) {
        return this.events.filter(function(event) {
          return _.contains(method.split(' '), event);
        }).skipDuplicates();
      },
      undo: function() {
        if (this.__currentStateIndex > 0) {
          this._changeToState(--this.__currentStateIndex, 'undo');
        }
        return this;
      },
      redo: function() {
        if (this.__currentStateIndex < this.maxStatesLength) {
          this._changeToState(++this.__currentStateIndex, 'redo');
        }
        return this;
      },
      destroy: function(options) {
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
      }
    };
    exports = Data;
    return exports;
  }({});
  _View_ = function(exports) {

    var _ = utils_helpers,
      _binders = utils_binders,
      _defaults = utils_defaults,
      _mixins = utils_mixins,
      View = function(options) {
        this.options = options;
        this.destroyDataOnRemove = false;
        this.events = [];
        this.callbacks = [];
        this.binders = [];
        this.subviews = [];
        _.extend(this, _mixins);
        _.extend(this, _defaults.view);
        _.extend(this, options || {});
        this.state = new Bacon.Bus();
        this.setData(this.data);
        this.setElement(this.el);
        this.state.onValue(_.bind(this.exec, this));
        return this;
      };
    View.prototype = {
      constructor: View,
      setData: function(data) {
        if (!this.options)
          return this;
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
      $: function(selector) {
        return _.$(selector, this.$el);
      },
      render: function() {
        this.state.push('beforeRender');
        if (this.template) {
          if (_.isString(this.template)) {
            this.template = this.fetchTemplate(this.template);
          }
          this.$el.html(_.isFunction(this.template) ? this.template(this.data.get()) : this.template);
        }
        this.bind();
        if (_.isArray(this.views)) {
          this.insertSubviews(this.views);
        }
        this.state.push('afterRender');
        return this;
      },
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
      setSubview: function(selector, subview) {
        var $wrapper = this.$(selector);
        if (!$wrapper.length) {
          throw new Error('no element found with the ' + selector + ' selector');
        }
        this.subviews.push(subview);
        $wrapper.append(subview.$el);
        return subview;
      },
      unbind: function() {
        this.$el.off();
        _.each(this.events, function(i, event) {
          if (this[event.name]) {
            this[event.name].onValue()();
            this[event.name] = null;
          }
        }, this);
        _.each(this.callbacks, function(callback) {
          callback();
        });
        _.each(this.subviews, function(subview) {
          subview.unbind();
        });
        _.each(this.binders, function(binder) {
          binder();
        }, this);
        this.binders = [];
        return this;
      },
      on: function(method) {
        return this.state.filter(function(event) {
          return _.contains(method.split(' '), event);
        }).skipDuplicates();
      },
      bindingPath: '',
      placeholderPath: '',
      bind: function() {
        var self = this,
          defeferredBinders = [];
        this.unbind();
        _.each(this.subviews, function(subview) {
          subview.bind();
        });
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
        _.each(_binders, function(binderType) {
          var selector = this.binderSelector + binderType,
            createBinder = function(pathAttribute) {
              var $el = $(this),
                path = pathAttribute || $el.attr(selector),
                binder;
              if (self.placeholderPath && self.bindingPath) {
                path = path.replace(self.placeholderPath, self.bindingPath);
              }
              if (!path) {
                throw new Error('The path to the data values is missing on the element ' + this);
              }
              path = path.replace(/[\n\r]+/g, '').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
              binder = _binders[binderType]($el, self.data, path);
              if (!binder.deferred) {
                binder.bind();
              } else {
                defeferredBinders.push(binder);
              }
              self.binders.push(binder.unbind);
            };
          this.$('[' + selector + ']').each(createBinder);
          var viewElementAttribute = this.$el.attr(selector);
          if (viewElementAttribute) {
            createBinder.call(this.el, viewElementAttribute);
          }
        }, this);
        _.each(defeferredBinders, function(binder) {
          binder.bind();
        });
        return this;
      },
      remove: function() {
        this.state.push('beforeRemove');
        this.state.end();
        this.unbind();
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
    exports = View;
    return exports;
  }({});
  Butter = function(exports) {

    exports = {
      helpers: utils_helpers,
      defaults: utils_defaults,
      mixins: utils_mixins,
      binders: utils_binders,
      Data: _Data_,
      View: _View_,
      create: {
        View: function(options) {
          return new Butter.View(options);
        },
        Data: function(options) {
          return new Butter.Data(options);
        }
      }
    };
    return exports;
  }({});

  return Butter;
}));
