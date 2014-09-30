define(function(require, exports, module) {
  'use strict';
  /**
   * @module Butter.binders
   */
  module.exports = {
    /**
     * To bind the text of any html element to the view data
     * [data-text] binder
     */
    'text': function($el, model, path) {
      return {
        set: function(value) {
          model
            .listen(path)
            .onValue($el, 'text');
        }
      };
    },
    /**
     * To bind the value of any text input
     * [data-val] binder
     */
    'val': function($el, model, path) {
      return {
        events: function() {
          var changes = $el.asEventStream('change');
          //model.changes.plug(changes.map())
        },
        get: function() {
          return $el.val();
        },
        set: function(value) {
          $el.val(value);
        }
      };
    }
  };
});