(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['baconjs','jquery'],function(Bacon,jQuery){
      // Also create a global in case some scripts
      // that are loaded still are looking for
      // a global even when an AMD loader is in use.
      return (root.Butter = factory(Bacon,jQuery));
    });
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