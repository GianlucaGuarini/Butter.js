/**
 * DOM data binders
 * @module Butter.binders
 */
Butter.binders = {
  /**
   * To bind the text of any html element to the view data
   * [data-text] binder
   */
  'text': {
    set: function(value) {
      this.$el.text(value);
    }
  },
  /**
   * To bind the value of any text input
   * [data-val] binder
   */
  'val': {
    events: 'change',
    get: function() {
      return this.$el.val();
    },
    set: function(value) {
      this.$el.val(value);
    }
  }
};