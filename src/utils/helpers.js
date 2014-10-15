define(function(require, exports, module) {
  //'use strict';
  //
  var _toString = Object.prototype.toString,
    _indexOf = Array.prototype.indexOf,
    _each = Array.prototype.forEach;
  /**
   * @module Butter.helpers
   */
  module.exports = {
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
});