(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['baconjs','jquery'],factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('baconjs'),require('jquery'));
  } else {
    // Browser globals (root is window)
    root.Butter = factory(Bacon,jQuery);
  }
}(this, function (Bacon,$) {
  'use strict';