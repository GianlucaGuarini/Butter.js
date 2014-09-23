/**
 * @module View
 */

module.exports = function(options) {
  /**
   * Default view options
   * @private
   */
  var _defaults = {
    el: null,
    model: null,
    bindings: {},
    events: {}
  };
  /**
   * Initialize this class with the options passed to it
   * @private
   */
  this._constructor = function() {
    // Extend the custom options to the defaults
    this.options = _.extend(options, _defaults);

    return this;
  };
  /**
   * Parse the view html and bind the DOM elements to the model
   * @return { Object } [description]
   */
  this.bind = function() {
    return this;
  };
};