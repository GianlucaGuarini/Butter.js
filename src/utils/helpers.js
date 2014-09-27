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