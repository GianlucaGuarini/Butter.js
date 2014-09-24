/**
 *
 * Version: 0.0.1-alpha
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
    define(['baconjs', 'jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Butter = factory();
  }
}(this, function() {
  var View, Butter;
  View = function(exports) {
    /**
     * @module View
     */
    exports = function(options) {
      var self = this,
        exec = function(callback) {
          if (typeof self[callback] === 'function') {
            self[callback].apply(self, arguments);
          }
        };
      this.bindings = [];
      this.views = [];
      this.state = new Bacon.Bus();
      this._setElement = function() {
        this.$el = options.el instanceof $ ? options.el : $(options.el);
        this.el = this.$el[0];
        if (!this.el) {
          console.warn(options.el + 'was not found!');
        }
        return this;
      };
      this._constructor = function() {
        for (var key in options) {
          var option = options[key];
          if (typeof option === 'function') {
            this[key] = option;
          }
        }
        this._setElement();
        exec('initialize');
        this.state.onValue(exec);
        return this;
      };
      this.render = function() {
        this.state.push('beforeRender');
        this.bind().state.push('afterRender');
        return this;
      };
      this.unbind = function() {
        this.$el.off();
        $(options.events).each(function(i, event) {
          if (self[event.name]) {
            self[event.name].onValue()();
            self[event.name] = null;
          }
        });
        return this;
      };
      this.bind = function() {
        this.unbind();
        $(options.events).each(function(i, event) {
          self[event.name] = self.$el.asEventStream(event.type, event.el);
        });
        return this;
      };
      this.remove = function() {
        this.state.push('beforeRemove');
        this.state.end();
        this.$el.remove();
        $(this).each(function(i, prop) {
          self[prop] = null;
        });
      };
      this._constructor();
      return this;
    };
    return exports;
  }({});
  Butter = function(exports) {
    exports = {
      View: View
    };
    return exports;
  }({});
  return Butter;
}));
