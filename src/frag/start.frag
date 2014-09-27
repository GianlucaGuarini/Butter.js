(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['baconjs','jquery'],factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    Bacon = require('baconjs');
    $ = require('jquery');
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.@SCRIPT = factory(Bacon,jQuery);
  }
}(this, function (Bacon,$) {
  'use strict';