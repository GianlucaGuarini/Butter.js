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