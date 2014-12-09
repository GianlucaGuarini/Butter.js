/**
 * Butter.js
 * Version: 0.0.1-alpha.12
 * Author: Gianluca Guarini
 * Contact: gianluca.guarini@gmail.com
 * Website: http://www.gianlucaguarini.com/
 * Twitter: @gianlucaguarini
 *
 * Copyright (c) Gianluca Guarini
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
      _       _
     (_\     /_)
       ))   ((
     .-"""""""-.
 /^\/  _.   _.  \/^\
 \(   /__\ /__\   )/
  \,  \o_/_\o_/  ,/
    \    (_)    /
     `-.'==='.-'
      __) - (__
     /  `~~~`  \
    /  /     \  \
    \ :       ; /
     \|==(*)==|/
      :       :
       \  |  /
     ___)=|=(___
    {____/ \____}

 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['baconjs', 'jquery'], function(Bacon, jQuery) {
      // Also create a global in case some scripts
      // that are loaded still are looking for
      // a global even when an AMD loader is in use.
      return (root.Butter = factory(Bacon, jQuery));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('baconjs'), require('jquery'));
  } else {
    // Browser globals (root is window)
    root.Butter = factory(Bacon, jQuery);
  }
}(this, function(Bacon, $) {
  var utils_helpers, utils_defaults, utils_mixins, utils_binders, utils_history, Butter, _Data_, _View_, _Router_, exports;
  utils_helpers = exports = function(exports) {

    var _toString = Object.prototype.toString,
      _keys = Object.keys,
      _indexOf = Array.prototype.indexOf,
      _each = Array.prototype.forEach,
      _parseObjectByPath = function(object, path) {
        var keyLength, i = 0,
          key;
        path = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.');
        keyLength = path && path.length;
        while (i < keyLength - 1) {
          key = path[i];
          if (!object[key])
            return;
          object = object[key];
          i++;
        }
        return {
          pathArray: path,
          lastKey: path[path.length - 1],
          value: object
        };
      };
    var _ = {
      $: $,
      isBoolean: function(value) {
        return typeof value === 'boolean';
      },
      isObject: function(value) {
        return _toString.call(value) === '[object Object]' && !_.isUndefined(value) && value !== null;
      },
      isString: function(value) {
        return typeof value === 'string';
      },
      isArray: function(value) {
        return _toString.call(value) === '[object Array]';
      },
      isRegExp: function(value) {
        return _toString.call(value) === '[object RegExp]';
      },
      isFunction: function(value) {
        return _toString.call(value) === '[object Function]';
      },
      isUndefined: function(value) {
        return typeof value === 'undefined';
      },
      isEqual: function(value1, value2) {
        return JSON.stringify(value1) === JSON.stringify(value2);
      },
      isEmpty: function(value) {
        if (_.isObject(value)) {
          return JSON.stringify(value).length === 2;
        } else {
          return value.length === 0;
        }
      },
      extend: function(destination, source) {
        for (var property in source) {
          destination[property] = source[property];
        }
        return destination;
      },
      difference: function(value1, value2, recursive) {
        var self = this,
          result = false;
        if (!_.isEqual(value1, value2)) {
          result = value1;
          if (_.isArray(value1)) {
            result = [];
            _.each(value1, function(value) {
              if (!self.contains(value2, value)) {
                result.push(value);
              }
            });
          } else if (_.isObject(value1)) {
            result = {};
            _.each(value1, function(key, value) {
              if (!value2[key]) {
                result[key] = value;
              }
            });
          }
        }
        return result;
      },
      clone: function(element) {
        if (_.isArray(element) || _.isObject(element)) {
          return JSON.parse(JSON.stringify(element));
        } else {
          return element;
        }
      },
      contains: function(array, value) {
        return !!~_.indexOf(array, value);
      },
      indexOf: function(array, value) {
        var result = -1,
          i = 0,
          arrayLength = array.length;
        if (_.isObject(value)) {
          for (; i < arrayLength; i++) {
            if (_.isEqual(array[i], value)) {
              result = i;
              break;
            }
          }
          return result;
        } else {
          if (_indexOf) {
            return _indexOf.call(array, value);
          } else {
            return Bacon._.indexOf(array, value);
          }
        }
      },
      each: function(iterator, callback, context) {
        var self = this,
          isObject = _.isObject(iterator);
        context = context || callback.prototype;
        if (!iterator)
          return;
        if (_each && _keys) {
          if (isObject) {
            _each.call(_keys(iterator), function(key) {
              callback.apply(context, [
                key,
                iterator[key]
              ]);
            });
          } else {
            _each.call(iterator, _.bind(callback, context));
          }
        } else {
          $.each(iterator, function(i, element) {
            callback.apply(context, isObject ? [
              i,
              element
            ] : [
              element,
              i
            ]);
          });
        }
      },
      keys: _keys || function(obj) {
        var keys = [];
        for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            keys.push(prop);
          }
        }
        return keys;
      },
      bind: function(func, context) {
        return function() {
          return func.apply(context, arguments);
        };
      },
      getObjectValueByPath: function(object, path) {
        var result = _parseObjectByPath(object, path);
        if (!result || !result.value)
          return;
        return result.value[result.lastKey];
      },
      setObjectValueByPath: function(object, path, value) {
        var result = _parseObjectByPath(object, path);
        if (!result || !result.value)
          return;
        if (value === null) {
          result.value[result.lastKey] = null;
          delete result.value[result.lastKey];
          return true;
        } else {
          result.value[result.lastKey] = value;
          return result.value;
        }
      }
    };
    exports = _;
    return exports;
  }({});
  utils_defaults = function(exports) {

    /**
     * @module Butter.defaults
     */
    exports = {
      view: {
        binderSelector: 'data-',
        destroyDatasCreated: true,
        tagName: 'div',
        id: null,
        className: null,
        fetchTemplate: function(template) {
          return $(template).html();
        },
        insert: function($el) {
          this.$el.append($el);
        }
      },
      data: {
        maxStatesLength: 10,
        emulateHTTP: true
      },
      router: {}
    };
    return exports;
  }({});
  utils_mixins = function(exports) {

    var _ = utils_helpers;
    exports = {
      extend: function(properties) {
        _.extend(this, properties);
        return this;
      },
      exec: function(callback) {
        if (typeof this[callback] === 'function') {
          this[callback].apply(this, arguments);
        }
      },
      removeProperties: function() {
        _.each(this, function(i, property) {
          this[property] = null;
          delete this[property];
        }, this);
      }
    };
    return exports;
  }({});
  utils_binders = function(exports) {

    var _ = utils_helpers,
      _killListeners = function(listeners) {
        _.each(listeners, function(listener) {
          listener();
        });
      },
      _addMarker = function() {
        return $('<script type="text/bacon-marker"></script>');
      };
    exports = {
      'each': function($el, data, path) {
        $el.removeAttr(Butter.defaults.view.binderSelector + 'each');
        var pathSplit = path.split(/\s+as\s+/gi),
          subviews = [],
          dataPath = pathSplit[0],
          placeholderPath = pathSplit[1],
          $parent = $el.parent(),
          addSubview = function(attributes, i) {
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
          $template = $el.clone().removeAttr(Butter.defaults.view.binderSelector + 'each');
        $el.remove();
        return {
          deferred: true,
          set: function() {
            var html = [];
            _.each(data.get(dataPath), function() {
              html.push(addSubview.apply(this, arguments).$el);
            }, this);
            $parent.append(html);
            html = null;
            data.listen(dataPath).debounce(50).onValue(_.bind(function(values) {
              var itemsCount = subviews.length - values.length;
              if (!itemsCount) {
                return;
              } else if (itemsCount > 0) {
                while (itemsCount--) {
                  subviews[subviews.length - 1].remove();
                  subviews.splice(subviews.length - 1, 1);
                }
              } else {
                html = [];
                while (itemsCount++ < 0) {
                  var i = values.length + itemsCount - 1;
                  html.push(addSubview(values[i], i).$el);
                }
                $parent.append(html);
              }
            }, this));
          },
          bind: function() {
            this.set();
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
      'if': function($el, data, path, inverse) {
        var listener, markerVisible = false,
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
      unless: function($el, data, path) {
        return this.show($el, data, path, true);
      },
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
      hide: function($el, data, path) {
        return this.show($el, data, path, true);
      },
      css: function($el, data, path) {
        var cssRules = path.split(/\s+(?:&&|and)\s+/gi),
          listeners = [];
        return {
          set: function() {
            _.each(cssRules, function(cssRulePath) {
              var pathSplit = cssRulePath.split(/\s+as\s+/gi);
              listeners.push(data.listen(pathSplit[0]).startWith(data.get(pathSplit[0])).assign($el, 'css', pathSplit[1]));
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
      'text': function($el, data, path) {
        var listener;
        return {
          set: function() {
            listener = data.listen(path).debounce(50).startWith(data.get(path)).onValue($el, 'text');
          },
          bind: function() {
            this.set();
          },
          unbind: function() {
            listener();
          }
        };
      },
      'value': function($el, data, path) {
        var listeners = [],
          events = $el.asEventStream('input change copy paste keyup');
        return {
          get: function() {
            listeners.push(events.map(function() {
              return $el.val();
            }).debounce(50).assign(data, 'set', path));
          },
          set: function() {
            listeners.push(data.listen(path).startWith(data.get(path)).assign($el, 'val'));
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
    return exports;
  }({});
  utils_history = function(exports) {
    var PATH_REGEXP = new RegExp([
      '(\\\\.)',
      '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
      '([.+*?=^!:${}()[\\]|\\/])'
    ].join('|'), 'g');

    function escapeGroup(group) {
      return group.replace(/([=!:$\/()])/g, '\\$1');
    }
    var attachKeys = function(re, keys) {
      re.keys = keys;
      return re;
    };

    function pathtoRegexp(path, keys, options) {
      if (keys && !Array.isArray(keys)) {
        options = keys;
        keys = null;
      }
      keys = keys || [];
      options = options || {};
      var strict = options.strict;
      var end = options.end !== false;
      var flags = options.sensitive ? '' : 'i';
      var index = 0;
      if (path instanceof RegExp) {
        var groups = path.source.match(/\((?!\?)/g) || [];
        keys.push.apply(keys, groups.map(function(match, index) {
          return {
            name: index,
            delimiter: null,
            optional: false,
            repeat: false
          };
        }));
        return attachKeys(path, keys);
      }
      if (Array.isArray(path)) {
        path = path.map(function(value) {
          return pathtoRegexp(value, keys, options).source;
        });
        return attachKeys(new RegExp('(?:' + path.join('|') + ')', flags), keys);
      }
      path = path.replace(PATH_REGEXP, function(match, escaped, prefix, key, capture, group, suffix, escape) {
        if (escaped) {
          return escaped;
        }
        if (escape) {
          return '\\' + escape;
        }
        var repeat = suffix === '+' || suffix === '*';
        var optional = suffix === '?' || suffix === '*';
        keys.push({
          name: key || index++,
          delimiter: prefix || '/',
          optional: optional,
          repeat: repeat
        });
        prefix = prefix ? '\\' + prefix : '';
        capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');
        if (repeat) {
          capture = capture + '(?:' + prefix + capture + ')*';
        }
        if (optional) {
          return '(?:' + prefix + '(' + capture + '))?';
        }
        return prefix + '(' + capture + ')';
      });
      var endsWithSlash = path[path.length - 1] === '/';
      if (!strict) {
        path = (endsWithSlash ? path.slice(0, -2) : path) + '(?:\\/(?=$))?';
      }
      if (!end) {
        path += strict && endsWithSlash ? '' : '(?=\\/|$)';
      }
      return attachKeys(new RegExp('^' + path + (end ? '$' : ''), flags), keys);
    }
    var location = window.history.location || window.location;
    var dispatch = true;
    var base = '';
    var running;
    var hashbang = false;
    var prevContext;

    function page(path, fn) {
      if ('function' === typeof path) {
        return page('*', path);
      }
      if ('function' === typeof fn) {
        var route = new Route(path);
        for (var i = 1; i < arguments.length; ++i) {
          page.callbacks.push(route.middleware(arguments[i]));
        }
      } else if ('string' === typeof path) {
        page['string' === typeof fn ? 'redirect' : 'show'](path, fn);
      } else {
        page.start(path);
      }
    }
    page.callbacks = [];
    page.exits = [];
    page.current = '';
    page.base = function(path) {
      if (0 === arguments.length)
        return base;
      base = path;
    };
    page.start = function(options) {
      options = options || {};
      if (running)
        return;
      running = true;
      if (false === options.dispatch)
        dispatch = false;
      if (false !== options.popstate)
        window.addEventListener('popstate', onpopstate, false);
      if (false !== options.click)
        window.addEventListener('click', onclick, false);
      if (true === options.hashbang)
        hashbang = true;
      if (!dispatch)
        return;
      var url = hashbang && ~location.hash.indexOf('#!') ? location.hash.substr(2) + location.search : location.pathname + location.search + location.hash;
      page.replace(url, null, true, dispatch);
    };
    page.stop = function() {
      page.current = '';
      if (!running)
        return;
      running = false;
      window.removeEventListener('click', onclick, false);
      window.removeEventListener('popstate', onpopstate, false);
    };
    page.show = function(path, state, dispatch) {
      page.current = path;
      var ctx = new Context(path, state);
      if (false !== dispatch)
        page.dispatch(ctx);
      if (false !== ctx.handled)
        ctx.pushState();
      return ctx;
    };
    page.redirect = function(from, to) {
      if ('string' === typeof from && 'string' === typeof to) {
        page(from, function(e) {
          setTimeout(function() {
            page.replace(to);
          }, 0);
        });
      }
      if ('string' === typeof from && 'undefined' === typeof to) {
        setTimeout(function() {
          page.replace(from);
        }, 0);
      }
    };
    page.replace = function(path, state, init, dispatch) {
      page.current = path;
      var ctx = new Context(path, state);
      ctx.init = init;
      ctx.save();
      if (false !== dispatch)
        page.dispatch(ctx);
      return ctx;
    };
    page.dispatch = function(ctx) {
      var prev = prevContext;
      var i = 0;
      var j = 0;
      prevContext = ctx;

      function nextExit() {
        var fn = page.exits[j++];
        if (!fn)
          return nextEnter();
        fn(prev, nextExit);
      }

      function nextEnter() {
        var fn = page.callbacks[i++];
        if (ctx.path !== page.current) {
          ctx.handled = false;
          return;
        }
        if (!fn)
          return unhandled(ctx);
        fn(ctx, nextEnter);
      }
      if (prev) {
        nextExit();
      } else {
        nextEnter();
      }
    };

    function unhandled(ctx) {
      if (ctx.handled)
        return;
      var current;
      if (hashbang) {
        current = base + location.hash.replace('#!', '');
      } else {
        current = location.pathname + location.search;
      }
      if (current === ctx.canonicalPath)
        return;
      page.stop();
      ctx.handled = false;
      location.href = ctx.canonicalPath;
    }
    page.exit = function(path, fn) {
      if (typeof path === 'function') {
        return page.exit('*', path);
      }
      var route = new Route(path);
      for (var i = 1; i < arguments.length; ++i) {
        page.exits.push(route.middleware(arguments[i]));
      }
    };
    page.reset = function() {
      this.callbacks = [];
      this.exits = [];
    };

    function decodeURLEncodedURIComponent(str) {
      return decodeURIComponent(str.replace(/\+/g, ' '));
    }

    function Context(path, state) {
      path = decodeURLEncodedURIComponent(path);
      if ('/' === path[0] && 0 !== path.indexOf(base))
        path = base + (hashbang ? '#!' : '') + path;
      var i = path.indexOf('?');
      this.canonicalPath = path;
      this.path = path.replace(base, '') || '/';
      if (hashbang)
        this.path = this.path.replace('#!', '') || '/';
      this.title = document.title;
      this.state = state || {};
      this.state.path = path;
      this.querystring = ~i ? path.slice(i + 1) : '';
      this.pathname = ~i ? path.slice(0, i) : path;
      this.params = [];
      this.hash = '';
      if (!hashbang) {
        if (!~this.path.indexOf('#'))
          return;
        var parts = this.path.split('#');
        this.path = parts[0];
        this.hash = parts[1] || '';
        this.querystring = this.querystring.split('#')[0];
      }
    }
    page.Context = Context;
    Context.prototype.pushState = function() {
      history.pushState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
    };
    Context.prototype.save = function() {
      history.replaceState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
    };

    function Route(path, options) {
      options = options || {};
      this.path = path === '*' ? '(.*)' : path;
      this.method = 'GET';
      this.regexp = pathtoRegexp(this.path, this.keys = [], options.sensitive, options.strict);
    }
    page.Route = Route;
    Route.prototype.middleware = function(fn) {
      var self = this;
      return function(ctx, next) {
        if (self.match(ctx.path, ctx.params))
          return fn(ctx, next);
        next();
      };
    };
    Route.prototype.match = function(path, params) {
      var keys = this.keys,
        qsIndex = path.indexOf('?'),
        pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
        m = this.regexp.exec(decodeURIComponent(pathname));
      if (!m)
        return false;
      for (var i = 1, len = m.length; i < len; ++i) {
        var key = keys[i - 1];
        var val = 'string' === typeof m[i] ? decodeURIComponent(m[i]) : m[i];
        if (key) {
          params[key.name] = undefined !== params[key.name] ? params[key.name] : val;
        } else {
          params.push(val);
        }
      }
      return true;
    };

    function onpopstate(e) {
      if (e.state) {
        var path = e.state.path;
        page.replace(path, e.state);
      } else {
        page.show(location.pathname + location.hash);
      }
    }

    function onclick(e) {
      if (1 !== which(e))
        return;
      if (e.metaKey || e.ctrlKey || e.shiftKey)
        return;
      if (e.defaultPrevented)
        return;
      var el = e.target;
      while (el && 'A' !== el.nodeName)
        el = el.parentNode;
      if (!el || 'A' !== el.nodeName)
        return;
      if (el.getAttribute('download'))
        return;
      var link = el.getAttribute('href');
      if (!hashbang && el.pathname === location.pathname && (el.hash || '#' === link))
        return;
      if (link && link.indexOf('mailto:') > -1)
        return;
      if (el.target)
        return;
      if (!sameOrigin(el.href))
        return;
      var path = el.pathname + el.search + (el.hash || '');
      var orig = path;
      path = path.replace(base, '');
      if (hashbang)
        path = path.replace('#!', '');
      if (base && orig === path)
        return;
      e.preventDefault();
      page.show(orig);
    }

    function which(e) {
      e = e || window.event;
      return null === e.which ? e.button : e.which;
    }

    function sameOrigin(href) {
      var origin = location.protocol + '//' + location.hostname;
      if (location.port)
        origin += ':' + location.port;
      return href && 0 === href.indexOf(origin);
    }
    page.sameOrigin = sameOrigin;
    exports = page;
    return exports;
  }({});
  _Data_ = function(exports) {

    var _ = utils_helpers,
      _defaults = utils_defaults,
      _mixins = utils_mixins,
      Data = function(initialValues) {
        this.__initialValues = initialValues;
        this.__currentStateIndex = 0;
        _.extend(this, _mixins);
        _.extend(this, _defaults.data);
        this.state = [];
        this.changes = new Bacon.Bus();
        this.events = new Bacon.Bus();
        this.isNew = true;
        if (!_.isUndefined(initialValues)) {
          this.set(initialValues);
        }
        return this;
      };
    Data.prototype = {
      constructor: Data,
      _changeToState: function(index, method) {
        if (this.state[index]) {
          this.__currentStateIndex = index;
          this.update(this.state[index].attributes, method);
        }
        return this;
      },
      toString: function() {
        return JSON.stringify(this.toJSON());
      },
      toJSON: function() {
        return this.get();
      },
      get: function(path) {
        var currentState = this.state[this.__currentStateIndex],
          attributes;
        if (_.isUndefined(currentState)) {
          attributes = undefined;
        } else if (_.isString(path)) {
          attributes = _.getObjectValueByPath(currentState.attributes, path);
        } else if (_.isObject(currentState.attributes) || _.isArray(currentState.attributes)) {
          attributes = currentState.attributes;
        } else {
          attributes = currentState.attributes;
        }
        return _.clone(attributes);
      },
      parse: function(data) {
        return data;
      },
      validate: function(data) {
        return true;
      },
      changedAttributes: function() {
        if (this.maxStatesLength > 2 && this.__currentStateIndex) {
          return _.difference(this.state[this.__currentStateIndex - 1].attributes, this.get());
        } else {
          return this.get();
        }
      },
      sync: function(method, options) {
        var httpVerb, ajax, data;
        options = options || {};
        if (!this.url) {
          throw new Error('This class instance doesn\'t have any url, it cannot be synched');
        }
        switch (method) {
          case 'save':
            if (this.isNew) {
              method = 'create';
              httpVerb = 'POST';
            } else {
              method = 'update';
              if (options.patch) {
                httpVerb = 'PATCH';
              } else {
                httpVerb = 'PUT';
              }
            }
            break;
          case 'delete':
            httpVerb = 'DELETE';
            break;
          default:
            method = 'read';
            httpVerb = 'GET';
        }
        if (httpVerb === 'PATCH') {
          data = this.changedAttributes();
        } else if (httpVerb !== 'GET') {
          data = this.get();
        }
        if (this.emulateHTTP && data) {
          data = _.extend({
            _method: httpVerb
          }, data);
        }
        ajax = $.ajax(_.extend({
          url: this.url,
          type: this.emulateHTTP ? httpVerb === 'GET' ? 'GET' : 'POST' : httpVerb,
          data: httpVerb === 'GET' ? null : JSON.stringify(data),
          dataType: 'json'
        }, options));
        ajax.always(_.bind(function() {
          this.events.push('sync');
        }, this));
        ajax.success(_.bind(function(data) {
          if (httpVerb === 'GET') {
            this.update(data, 'read');
          } else {
            this.events.push(method);
          }
        }, this));
        ajax.fail(_.bind(this.events.error, this.events));
        return new Bacon.fromPromise(ajax);
      },
      fetch: function(options) {
        return this.sync('read', options);
      },
      save: function(options) {
        return this.sync('save', options);
      },
      set: function() {
        var args = arguments,
          attributes = this.toJSON(),
          mustUpdate = false;
        if (args.length === 2 && _.isString(args[0]) && !_.isUndefined(args[1])) {
          mustUpdate = _.setObjectValueByPath(attributes, args[0], args[1]);
        } else {
          if (_.isObject(attributes)) {
            _.extend(attributes, args[0]);
          } else {
            attributes = args[0];
          }
          mustUpdate = true;
        }
        if (mustUpdate) {
          this.update(attributes, 'set');
        }
        return this;
      },
      unset: function(path) {
        var attributes = this.get();
        if (path) {
          _.setObjectValueByPath(attributes, path, null);
        } else {
          attributes = undefined;
        }
        this.update(attributes, 'unset');
        return this;
      },
      reset: function() {
        this.update(this.__initialValues, 'reset');
        return this;
      },
      add: function(item, path, at) {
        var array = _.isString(path) ? this.get(path) : this.get();
        if (!_.isArray(array)) {
          throw new Error('You cannot push new data in an element that is not an array');
        } else {
          array.splice(at || array.length, 0, item);
          if (path) {
            this.set(path, array);
          } else {
            this.update(array, 'add');
          }
        }
        return this;
      },
      remove: function(item, path) {
        var array = _.isString(path) ? this.get(path) : this.get(),
          itemIndex;
        if (!_.isArray(array)) {
          throw new Error('You cannot remove data from an element that is not an array');
        } else {
          itemIndex = _.indexOf(array, item);
          if (!~itemIndex)
            throw new Error(JSON.stringify(item) + ' was not found in this array');
          array.splice(itemIndex, 1);
          if (path) {
            this.set(path, array);
          } else {
            this.update(array, 'remove');
          }
        }
        return this;
      },
      update: function(attributes, method) {
        var validation = this.validate(attributes);
        if (validation !== true) {
          this.events.error(validation);
          return false;
        }
        attributes = this.parse(attributes);
        if (_.contains([
            'set',
            'unset',
            'reset',
            'read',
            'add',
            'remove'
          ], method)) {
          this.state.push({
            method: method,
            attributes: attributes
          });
          if (this.state.length > this.maxStatesLength + 1) {
            this.state.shift();
          }
          this.__currentStateIndex = this.state.length - 1;
          if (_.isArray(attributes)) {
            this.length = attributes.length;
          }
        }
        this.changes.push(attributes);
        this.events.push(method);
        this.attributes = attributes;
        return this;
      },
      clone: function() {
        return new Butter.Data(this.get()).extend(this);
      },
      bind: function(destination, sourcePath, destinationPath, doubleWay) {
        var self = this,
          _doubleWay = _.isUndefined(doubleWay) ? true : doubleWay;
        if (_doubleWay) {
          destination.listen(destinationPath).onValue(function(value) {
            self.set.apply(self, sourcePath ? [
              sourcePath,
              value
            ] : [value]);
          });
        }
        this.listen(sourcePath).onValue(function(value) {
          destination.set.apply(destination, destinationPath ? [
            destinationPath,
            value
          ] : [value]);
        });
        return this;
      },
      listen: function(path) {
        var initialValue, stream;
        if (path) {
          initialValue = this.get(path);
          stream = this.changes.map('.' + path);
        } else {
          initialValue = this.get();
          stream = this.changes;
        }
        return stream.startWith(initialValue).skipWhile(function(value) {
          return _.isEqual(value, initialValue);
        }).skipDuplicates(_.isEqual);
      },
      on: function(method) {
        return this.events.filter(function(event) {
          return _.contains(method.split(' '), event);
        }).skipDuplicates();
      },
      undo: function() {
        if (this.__currentStateIndex > 0) {
          this._changeToState(--this.__currentStateIndex, 'undo');
        }
        return this;
      },
      redo: function() {
        if (this.__currentStateIndex < this.maxStatesLength) {
          this._changeToState(++this.__currentStateIndex, 'redo');
        }
        return this;
      },
      destroy: function(options) {
        var requestStream, onModelDestroyed = _.bind(function() {
          this.changes.end();
          this.events.end();
          this.removeProperties();
        }, this);
        if (this.url && !this.isNew) {
          this.sync('delete', options).done(onModelDestroyed);
        } else {
          onModelDestroyed();
        }
      }
    };
    exports = Data;
    return exports;
  }({});
  _View_ = function(exports) {

    var _ = utils_helpers,
      _binders = utils_binders,
      _defaults = utils_defaults,
      _mixins = utils_mixins,
      View = function(options) {
        this.options = options;
        this.destroyDataOnRemove = false;
        this.events = [];
        this.callbacks = [];
        this.binders = [];
        this.subviews = [];
        _.extend(this, _mixins);
        _.extend(this, _defaults.view);
        _.extend(this, options || {});
        this.state = new Bacon.Bus();
        this.setData(this.data);
        this.setElement(this.el);
        this.state.onValue(_.bind(this.exec, this));
        return this;
      };
    View.prototype = {
      constructor: View,
      setData: function(data) {
        if (this.data && this.destroyDataOnRemove && this.data instanceof Butter.Data) {
          this.data.destroy();
        }
        if (data && data instanceof Butter.Data) {
          this.data = data;
        } else {
          this.data = new Butter.Data(data || {});
          if (this.destroyDatasCreated) {
            this.destroyDataOnRemove = true;
          }
        }
        return this;
      },
      setElement: function(el) {
        var attributes = {};
        if (el) {
          this.$el = el instanceof _.$ ? this.options.el : _.$(el);
        } else {
          this.$el = $('<' + this.tagName + '>');
        }
        this.el = this.$el[0];
        if (this.className) {
          attributes['class'] = this.className;
        }
        if (this.id) {
          attributes.id = this.id;
        }
        this.$el.attr(attributes);
        return this;
      },
      $: function(selector) {
        return _.$(selector, this.$el);
      },
      render: function() {
        this.state.push('beforeRender');
        if (this.template) {
          if (_.isString(this.template)) {
            this.template = this.fetchTemplate(this.template);
          }
          this.$el.html(_.isFunction(this.template) ? this.template(this.data.get()) : this.template);
        }
        this.bind();
        if (_.isArray(this.views)) {
          this.insertSubviews(this.views);
        }
        this.state.push('afterRender');
        return this;
      },
      insertSubviews: function(subviews) {
        _.each(subviews, function(subviewObj) {
          var selector = _.keys(subviewObj)[0],
            subview = subviewObj[selector];
          if (selector) {
            this.setSubview(selector, subview);
          } else {
            this.insertSubview(subview);
          }
          subview.render();
        }, this);
        return this;
      },
      insertSubview: function(subview) {
        this.subviews.push(subview);
        this.insert(subview.$el);
        return subview;
      },
      setSubview: function(selector, subview) {
        var $wrapper = this.$(selector);
        if (!$wrapper.length) {
          throw new Error('no element found with the ' + selector + ' selector');
        }
        this.subviews.push(subview);
        $wrapper.append(subview.$el);
        return subview;
      },
      unbind: function() {
        this.$el.off();
        _.each(this.events, function(i, event) {
          if (this[event.name]) {
            this[event.name].onValue()();
            this[event.name] = null;
          }
        }, this);
        _.each(this.callbacks, function(callback) {
          callback();
        });
        _.each(this.subviews, function(subview) {
          subview.unbind();
        });
        _.each(this.binders, function(binder) {
          binder();
        }, this);
        this.binders = [];
        return this;
      },
      on: function(method) {
        return this.state.filter(function(event) {
          return _.contains(method.split(' '), event);
        }).skipDuplicates();
      },
      bindingPath: '',
      placeholderPath: '',
      bind: function() {
        var self = this,
          defeferredBinders = [],
          initBinder = function($el, selector, binderType) {
            var path = $el.attr(selector),
              binder;
            if (!path)
              return;
            if (self.placeholderPath && self.bindingPath) {
              path = path.replace(self.placeholderPath, self.bindingPath);
            }
            path = path.replace(/[\n\r]+/g, '').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
            binder = _binders[binderType]($el, self.data, path);
            if (!binder.deferred) {
              binder.bind();
            } else {
              defeferredBinders.push(binder);
            }
            self.binders.push(binder.unbind);
          };
        this.unbind();
        _.each(this.subviews, function(subview) {
          subview.bind();
        });
        _.each(_binders, function(binderType) {
          var selector = this.binderSelector + binderType;
          this.$('[' + selector + ']').each(function() {
            initBinder($(this), selector, binderType);
          });
          initBinder(this.$el, selector, binderType);
        }, this);
        _.each(defeferredBinders, function(binder) {
          binder.bind();
        });
        _.each(this.events, function(event, i) {
          if (event.name) {
            this[event.name] = this.$el.asEventStream(event.type, event.el);
            if (this.methods[event.name] && _.isFunction(this.methods[event.name])) {
              this.callbacks.push(this[event.name].onValue(_.bind(this.methods[event.name], this)));
            }
          } else {
            throw new Error('You must specify an event name for each event assigned to this view');
          }
        }, this);
        return this;
      },
      remove: function() {
        this.state.push('beforeRemove');
        this.state.end();
        this.unbind();
        if (this.destroyDataOnRemove) {
          this.data.destroy();
        }
        _.each(this.subviews, function(subview) {
          subview.remove();
        }, this);
        if (this.$el) {
          this.$el.remove();
        }
        this.removeProperties();
      }
    };
    exports = View;
    return exports;
  }({});
  _Router_ = function(exports) {

    var _ = utils_helpers,
      _binders = utils_binders,
      _defaults = utils_defaults,
      _mixins = utils_mixins,
      _page = utils_history.exports,
      Router = function(options) {
        _.extend(this, _mixins);
        console.log(_page);
        _page(options);
        return this;
      };
    Router.prototype = {
      constructor: Router,
      _routes: [],
      history: _page,
      map: function(url) {
        var stream = new Bacon.Bus();
        _page(url, function(ctx) {
          stream.push(ctx);
        });
        this._routes.push(url);
        return stream;
      },
      reset: function() {},
      removeRoute: function(url) {}
    };
    exports = Router;
    return exports;
  }({});
  Butter = function(exports) {

    exports = {
      helpers: utils_helpers,
      defaults: utils_defaults,
      mixins: utils_mixins,
      binders: utils_binders,
      history: utils_history,
      Data: _Data_,
      View: _View_,
      Router: _Router_,
      create: {
        View: function(options) {
          return new Butter.View(options);
        },
        Data: function(options) {
          return new Butter.Data(options);
        }
      }
    };
    return exports;
  }({});

  return Butter;
}));
