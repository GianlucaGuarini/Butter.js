define(function(require, exports, module) {
  'use strict';
  /**
   * @module Butter.Router
   */
  var _ = require('./utils/helpers'),
    _binders = require('./utils/binders'),
    _defaults = require('./utils/defaults'),
    _mixins = require('./utils/mixins'),
    _page = require('page'),
    Router = function() {
      // extend this class with the default mixins used for any Butter class
      _.extend(this, _mixins);
      return this;
    };

  Router.prototype = {
    constructor: Router,
    /**
     *
     * @public
     * @param  { String|Regex } url
     * @return { Bacon.EventStream }
     */
    map: function(url) {
      var stream = new Bacon.Bus();

      _page(url, function(ctx) {
        stream.push(ctx);
      });

      return stream;
    }
  };

  module.exports = Router;

});