define(function(require, exports, module) {
  'use strict';
  var _ = require('../utils/helpers'),
    _marker = function() {
      var $el = $('<span class="butter-marker" />');
      $el.hide();
      return $el;
    };
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
    'each': function($el, data, path) {

      $el.removeAttr(Butter.defaults.view.binderSelector + 'each');
      // split the path of the selector
      var pathSplit = path.split(/\s+as\s+/gi),
        // here we will cache all the subviews created
        subviews = [],
        // this will be the name of
        dataPath = pathSplit[0],
        placeholderPath = pathSplit[1],
        $parent = $el.parent(),
        // remove the binderSelector, we don't need it anymore
        $template = $el.clone().removeAttr(Butter.defaults.view.binderSelector + 'each');

      $el.remove();

      return {
        deferred: true,
        addSubview: function(attributes, i) {
          var $newEl = $template.clone(),
            newView;

          newView = new Butter.View({
            el: $newEl,
            data: data,
            placeholderPath: placeholderPath,
            bindingPath: dataPath + '.' + i
          });

          subviews.push(newView);

          newView.bind();

          return newView;
        },
        get: function() {

        },
        set: function() {
          var html = [];
          _.each(data.get(dataPath), function() {
            html.push(this.addSubview.apply(this, arguments).$el);
          }, this);

          // detect the new views to append
          $parent.append(html);
          html = null;

          data.listen(dataPath).debounce(50).onValue(_.bind(function(values) {
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
          subviews = null;
          $el.attr(Butter.defaults.view.binderSelector + 'each', path);
          $parent.append($el);
        }
      };
    },
    /**
     * Display the element if bound to a truthy property
     * [data-show] binder
     */
    show: function($el, data, path, inverse) {
      var listener;
      return {
        deferred: true,
        get: function() {
          var onChange = function(value) {
            if (value) {
              $el[inverse ? 'hide' : 'show']();
            } else {
              $el[inverse ? 'show' : 'hide']();
            }
          };
          listener = data.listen(path).debounce(50).onValue(onChange);
          onChange(data.get(path));
        },
        bind: function() {
          this.get();
        },
        unbind: function() {
          listener();
        }
      };
    },
    /**
     * Hide the element if bound to a falsy property
     * [data-hide] binder
     */
    hide: function($el, data, path) {
      return this.show($el, data, path, true);
    },
    /**
     * To bind the text of any html element to the view data
     * [data-text] binder
     */
    'text': function($el, data, path) {
      var listener;
      return {
        set: function() {
          $el.text(data.get(path));
          listener = data
            .listen(path)
            .debounce(50)
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