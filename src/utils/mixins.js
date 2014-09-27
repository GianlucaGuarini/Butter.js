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