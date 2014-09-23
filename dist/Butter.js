/**
      _       _
     (_\     /_)
       ))   ((
     .-"""""""-.
 /^\/  _.   _.  \/^\
 \(   /__\ /__\   )/
  \,  \o_/_\o_/  ,/
    \    (_)    /
     `-.'==='.-'
      __) - (__
     /  `~~~`  \
    /  /     \  \
    \ :       ; /
     \|==(*)==|/
      :       :
       \  |  /
     ___)=|=(___
    {____/ \____}

 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Butter = factory();
  }
}(this, function() {
  var Model, View, main;
  Model = function(exports) {
    /**
     * @module Model
     */
    exports = Bacon.Model;
    return exports;
  }({});
  View = function(exports) {
    /**
     * @module View
     */
    exports = function(options) {
      var _defaults = {
        el: null,
        model: null,
        bindings: {},
        events: {}
      };
      this._constructor = function() {
        this.options = _.extend(options, _defaults);
        return this;
      };
      this.bind = function() {
        return this;
      };
    };
    return exports;
  }({});
  main = function(exports) {
    var Butter = {};
    Butter.Model = Model;
    Butter.View = View;
    exports = Butter;
    return exports;
  }({});
  return main;
}));