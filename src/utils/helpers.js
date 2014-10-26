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
      /*console.log(JSON.stringify(value1) + '===' + JSON.stringify(value2));
      console.log(JSON.stringify(value1) === JSON.stringify(value2));*/
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

      if (!iterator) return;

      if (_each && _keys) {
        if (isObject) {
          _each.call(_keys(iterator), function(key) {
            callback.apply(context, [key, iterator[key]]);
          });
        } else {
          _each.call(iterator, helpers.bind(callback, context));
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

  module.exports = helpers;
});