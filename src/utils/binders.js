define(function(require, exports, module) {
  'use strict';
  var _ = require('../utils/helpers'),
    _killListeners = function(listeners) {
      _.each(listeners, function(listener) {
        listener();
      });
    },
    _addMarker = function() {
      return $('<script type="text/bacon-marker"></script>');
    };
  /**
   * @module Butter.binders
   */
  module.exports = {
    /**
     * To loop and bind an array or an object to a DOM element
     * [data-each] binder
     * @prop path: in this    case the path value must contain the 'as'
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
     * Remove/show the element from the DOM if bound to a truthy property
     * [data-if] binder
     */
    'if': function($el, data, path, inverse) {
      var listener,
        markerVisible = false,
        $marker = _addMarker(),
        showMarker = function() {
          if (!markerVisible) {
            markerVisible = true;
            $el.replaceWith($marker);
          }
        },
        hideMarker = function() {
          if (markerVisible) {
            markerVisible = false;
            $marker.replaceWith($el);
          }
        };
      return {
        deferred: true,
        get: function() {
          var onChange = function(value) {
            if (value) {
              if (inverse) {
                showMarker();
              } else {
                hideMarker();
              }
            } else {
              if (inverse) {
                hideMarker();
              } else {
                showMarker();
              }
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
     * Remove/show the element from the DOM if bound to a falsy property
     * [data-unless] binder
     */
    unless: function($el, data, path) {
      return this.show($el, data, path, true);
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
     * Apply any css to the element binding it to its data
     * [data-css] binder
     */
    css: function($el, data, path) {
      // split the path of the selector
      var cssRules = path.split(/\s+(?:&&|and)\s+/gi),
        listeners = [];

      return {
        set: function() {
          _.each(cssRules, function(cssRulePath) {

            var pathSplit = cssRulePath.split(/\s+as\s+/gi);

            listeners.push(
              data
              .listen(pathSplit[0])
              .startWith(data.get(pathSplit[0]))
              .assign($el, 'css', pathSplit[1])
            );
          });
        },
        bind: function() {
          this.set();
        },
        unbind: function() {
          _killListeners(listeners);
        }
      };

    },
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
            .debounce(50)
            .startWith(data.get(path))
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
        events = $el.asEventStream('input change copy paste keyup');
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
          listeners
            .push(data.listen(path)
              .startWith(data.get(path))
              .assign($el, 'val'));

        },
        bind: function() {
          this.set();
          this.get();
        },
        unbind: function() {
          _killListeners(listeners);
        }
      };
    }
  };
});