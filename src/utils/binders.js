define(function(require, exports, module) {
  'use strict';
  var _ = require('../utils/helpers');
  /**
   * @module Butter.binders
   */
  module.exports = {
    /**
     * To bind the text of any html element to the view data
     * [data-text] binder
     */
    'text': function($el, data, path) {
      var listener;
      return {
        set: function() {
          listener = data
            .listen(path)
            .onValue($el, 'text');
        },
        bind: function() {
          this.set();
        },
        unbind: function() {
          listener();
        }
      };
    },
    /**
     * To bind the value of any text input
     * [data-value] binder
     */
    'value': function($el, data, path) {
      var listeners = [],
        events = $el.asEventStream('keydown');
      return {
        get: function() {
          listeners.push(
            events.map(function() {
              return $el.val();
            }).assign(data, 'set', path)
          );
        },
        set: function() {
          listeners.push(data.listen(path).assign($el, 'val'));
        },
        bind: function() {
          this.set();
          this.get();
        },
        unbind: function() {
          _.each(listeners, function(listener) {
            listener();
          });
        }
      };
    }
  };
});