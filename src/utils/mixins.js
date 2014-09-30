define(function(require, exports, module) {
  'use strict';
  var _ = require('../utils/helpers');
  /**
   * @module Butter.mixins
   */
  module.exports = {
    /**
     * Extend the current class with adding other methods
     * @public
     */
    extend: function(properties) {
      return _.extend(true, this, properties);
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
      _.each(this, function(i, property) {
        this[property] = null;
        delete this[property];
      }, this);
    }
  };
});