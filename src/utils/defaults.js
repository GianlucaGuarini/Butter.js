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
    data: {
      maxStatesLength: 10,
      emulateHTTP: true
    }
  };
});