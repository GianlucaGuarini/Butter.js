define(function(require, exports, module) {
  'use strict';
  var _ = require('../utils/helpers');
  /**
   * @module Butter.binders
   */
  module.exports = {
    /**
     * To loop and bind an array or an object to a DOM element
     * [data-each] binder
     * @prop path: in this case the path value must contain the 'as'
     * keyword to specify the values that must be used inside the loop
     */
    'each': function($el, data, path, view) {
      // remove the binderSelector, we don't need it anymore
      $el.removeAttr(view.binderSelector + 'each');
      // split the path of the selector
      var pathSplit = path.split(/\s+as\s+/gi),
        // here we will cache all the subviews created
        subviews = [],
        // this will be the name of
        attributeName = pathSplit[1],
        $parent = $el.parent(),
        $template = $el.clone();

      $el.remove();
      path = pathSplit[0];

      return {
        addSubview: function(attributes, i) {
          var $newEl = $template.clone(),
            newView,
            newData,
            obj = {};

          obj[attributeName] = attributes;

          newData = new Butter.Data(obj);
          newData.maxStatesLength = 1;
          data.bind(newData, path + '.' + i, attributeName, true);

          newView = new Butter.View({
            el: $newEl,
            data: newData
          });

          newView.destroyDataOnRemove = true;
          subviews.push(newView);

          newView.bind();

          return newView;
        },
        get: function() {

        },
        set: function() {
          var html = [];
          _.each(data.get(path), function() {
            html.push(this.addSubview.apply(this, arguments).$el);
          }, this);
          // detect the new views to append
          view.state.map('.afterRender').onValue(function() {
            $parent.append(html);
            return Bacon.End;
          });

          data.listen(path).onValue(_.bind(function(values) {
            var itemsCount = subviews.length - values.length;

            if (!itemsCount) {
              // nothing changed
              return;
            } else if (itemsCount > 0) {
              // remove items
              while (itemsCount--) {
                subviews[subviews.length - 1].remove();
                subviews.splice(subviews.length - 1, 1);
              }
            } else {
              // add items
              html = [];
              while (itemsCount++ < 0) {
                var i = values.length + itemsCount - 1;
                html.push(this.addSubview(values[i], i).$el);
              }
              $parent.append(html);
            }
          }, this));
        },
        bind: function() {
          this.set();
          this.get();
        },
        unbind: function() {
          _.each(subviews, function(subview) {
            subview.remove();
          });
        }
      };
    },
    /**
     * To bind the text of any html element to the view data
     * [data-text] binder
     */
    'text': function($el, data, path, view) {
      var listener;
      return {
        set: function() {
          $el.text(data.get(path));
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
    'value': function($el, data, path, view) {
      var listeners = [],
        events = $el.asEventStream('input change copy paste');
      return {
        get: function() {
          listeners.push(
            events.map(function() {
              return $el.val();
            })
            .debounce(50)
            .assign(data, 'set', path)
          );
        },
        set: function() {
          listeners.push(data.listen(path).assign($el, 'val'));
          $el.val(data.get(path));
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