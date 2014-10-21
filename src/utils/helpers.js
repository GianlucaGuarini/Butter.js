define(function(require, exports, module) {
  'use strict';
  //
  /**
   * Private methods
   */
  var _toString = Object.prototype.toString,
    _keys = Object.keys,
    _indexOf = Array.prototype.indexOf,
    _each = Array.prototype.forEach,
    _parseObjectByPath = function(object, path) {
      var keyLength,
        i = 0,
        key;

      path = path.replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
      .replace(/^\./, '') // strip a leading dot
      .split('.');

      keyLength = path && path.length;

      while (i < keyLength - 1) {
        key = path[i];

        if (!object[key]) return;

        object = object[key];

        i++;
      }

      return {
        pathArray: path,
        lastKey: path[path.length - 1],
        value: object
      };
    };
  /**
   * @module Butter.helpers
   */
  module.exports = {
    $: $,
    isBoolean: function(value) {
      return typeof value === 'boolean';
    },
    isObject: function(value) {
      return _toString.call(value) === '[object Object]' && !this.isUndefined(value);
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
      var self = this,
        isObject = this.isObject(iterator);

      context = context || callback.prototype;

      if (!iterator) return;

      if (_each && _keys) {
        if (isObject) {
          _each.call(_keys(iterator), function(key) {
            callback.apply(context, [key, iterator[key]]);
          });
        } else {
          _each.call(iterator, this.bind(callback, context));
        }
      } else {
        $.each(iterator, function(i, element) {
          callback.apply(context, isObject ? [i, element] : [element, i]);
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
      if (!result || !result.value) return;
      return result.value[result.lastKey];
    },

    setObjectValueByPath: function(object, path, value) {

      var result = _parseObjectByPath(object, path);

      if (!result || !result.value) return;

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
});