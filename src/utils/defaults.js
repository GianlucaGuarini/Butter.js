define(function(require, exports, module) {
  'use strict';
  /**
   * @module Butter.defaults
   */
  module.exports = {
    view: {
      binderSelector: 'data-',
      destroyModelsCreated: true
    },
    model: {
      maxStatesLength: 10
    }
  };
});