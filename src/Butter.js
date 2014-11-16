define(function(require, exports, module) {
  'use strict';
  /**
   * @module Butter
   */
  module.exports = {
    /**
     * Include some helpers to make everything smoother
     * @module Butter.helpers
     */
    helpers: require('./utils/helpers'),

    /**
     * Default Butter default Options
     * @module Butter.defaults
     */
    defaults: require('./utils/defaults'),
    /**
     * Some useful mixins extending any Butter.js class
     * @module Butter.mixins
     */
    mixins: require('./utils/mixins'),
    /**
     * DOM data binders
     * @module Butter.binders
     */
    binders: require('./utils/binders'),
    /**
     * @module Butter.history
     * It relies on page.js
     * https://github.com/visionmedia/page.js
     */
    history: require('./utils/history'),
    /**
     * @module Butter.Data
     */
    Data: require('./Data'),
    /**
     * @module Butter.View
     */
    View: require('./View'),

    /**
     * @module Butter.Router
     */
    Router: require('./Router'),
    /**
     * Handy helper to create new Butter instances
     */
    create: {
      View: function(options) {
        return new Butter.View(options);
      },
      Data: function(options) {
        return new Butter.Data(options);
      }
    }
  };
});