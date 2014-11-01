define(function(require, exports, module) {
  'use strict';
  /**
   * @module Butter.defaults
   */
  module.exports = {
    view: {
      binderSelector: 'data-',
      destroyDatasCreated: true,
      tagName: 'div',
      id: null,
      className: null,
      /**
       * It could be used to fetch the template via ajax
       * It takes the template from the DOM
       * @param  { String } template
       * @return { String }
       */
      fetchTemplate: function(template) {
        return $(template).html();
      },
      /**
       * This function is used to inject the subview in their parents
       * @param  { Object } $el
       */
      insert: function($el) {
        this.$el.append($el);
      }
    },
    data: {
      maxStatesLength: 10,
      emulateHTTP: true
    }
  };
});