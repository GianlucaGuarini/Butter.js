define(function(require, exports, module) {
  'use strict';
  /**
   * @module Butter.Data
   */

  var _ = require('./utils/helpers'),
    _defaults = require('./utils/defaults'),
    _mixins = require('./utils/mixins'),
    Data = function(initialValues) {
      this.__initialValues = initialValues;
      this.__currentStateIndex = 0;
      // extend this class with the default mixins used for any Butter class
      _.extend(this, _mixins);
      // getting some useful options shared between any Data class
      _.extend(this, _defaults.data);

      // this array will contain all the values of this class
      // its max length is specified in the Butter.defaults.data
      this.state = [];
      // creating the changes stream that could be listened from the outside
      this.changes = new Bacon.Bus();
      // stream that could be listened to check all the events triggered by this class
      this.events = new Bacon.Bus();
      // A data class instance is new if it has never been synched before with the server
      this.isNew = true;

      // set the initial data
      if (!_.isUndefined(initialValues)) {
        this.set(initialValues);
      }

      return this;
    };

  Data.prototype = {
    constructor: Data,

    /**
     * Change this class data restoring them to a previous state
     * @private
     */
    _changeToState: function(index, method) {
      if (this.state[index]) {
        this.__currentStateIndex = index;
        this.update(this.state[index].attributes, method);
      }

      return this;
    },
    /**
     * Return this class data as valid string
     * @public
     */
    toString: function() {
      return JSON.stringify(this.toJSON());
    },
    /**
     * Return this class data as javascript object
     * @public
     */
    toJSON: function() {
      return this.get();
    },
    /**
     * Get any value of this class by a path
     * If no path is specified we get all the class attributes
     * @param { String } path: the path to the attribute
     * @public
     */
    get: function(path) {

      var currentState = this.state[this.__currentStateIndex],
        attributes;

      if (_.isUndefined(currentState)) {
        attributes = undefined;
      } else if (_.isString(path)) {
        // get an internal property of this class
        attributes = _.getObjectValueByPath(currentState.attributes, path);
      } else if (_.isObject(currentState.attributes) || _.isArray(currentState.attributes)) {
        // return the all class attributes by cloning them in a new object
        attributes = currentState.attributes;
      } else {
        attributes = currentState.attributes;
      }

      return _.clone(attributes);
    },
    /**
     * Parse the data sent to this class
     * @param  { Object|Array } data
     * @return { Object|Array }
     */
    parse: function(data) {
      return data;
    },
    /**
     * Validate the data sent to this class
     * if it returns false this data will not set
     * @param  { Object|Array } data
     * @return { Boolean }
     */
    validate: function(data) {
      return true;
    },
    /**
     * Return the difference between the current state of the class and the previous one
     * @return { Object|Array }
     */
    changedAttributes: function() {
      if (this.maxStatesLength > 2 && this.__currentStateIndex) {
        return _.difference(this.state[this.__currentStateIndex - 1].attributes, this.get());
      } else {
        return this.get();
      }
    },
    /**
     * Method used to sync the class data with any server via ajax
     * TODO: clean up the code in this function
     * @param  { String } method: 'save', 'read', 'delete'
     * @param  { Object } options: custom $.ajax options
     * @return { Object } jQuery promise
     */
    sync: function(method, options) {

      var httpVerb,
        ajax,
        data;

      options = options || {};

      if (!this.url) {
        throw new Error('This class instance doesn\'t have any url, it cannot be synched');
      }

      // Map the method to an http verb
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
        type: this.emulateHTTP ? (httpVerb === 'GET' ? 'GET' : 'POST') : httpVerb,
        data: httpVerb === 'GET' ? null : JSON.stringify(data),
        dataType: 'json'
      }, options));

      // always
      ajax.always(
        _.bind(function() {
          this.events.push('sync');
        }, this)
      );

      // success
      ajax.success(_.bind(function(data) {
        if (httpVerb === 'GET') {
          this.update(data, 'read');
        } else {
          this.events.push(method);
        }
      }, this));

      // error
      ajax.fail(_.bind(this.events.error, this.events));

      return new Bacon.fromPromise(ajax);
    },
    /**
     * Get the data directly from the server
     * @param  { Object } options: jquery ajax oprions
     * @return { Bacon.EventStream }
     */
    fetch: function(options) {
      return this.sync('read', options);
    },
    /**
     * Save the current dataset on the server
     * @param  { Object } options: jquery ajax oprions
     * @return { Bacon.EventStream }
     */
    save: function(options) {
      return this.sync('save', options);
    },
    /**
     * Set/Update the data managed by this class
     * selecting a deep property or just using an object
     * @param { Object|String } : path to a deep value to update or object to set/update
     * @param { * } : in case of a path for a deep update here you can set the new property
     * @public
     */
    set: function() {

      // get all the current class attributes
      var args = arguments,
        attributes = this.toJSON(),
        // assuming we don't need to update this
        mustUpdate = false;

      // do we need to update a deep attribute?
      if (args.length === 2 && _.isString(args[0]) && !_.isUndefined(args[1])) {

        // update the deep value or return false
        mustUpdate = _.setObjectValueByPath(attributes, args[0], args[1]);

      } else {
        // update or add new values
        if (_.isObject(attributes)) {
          _.extend(attributes, args[0]);
        } else {
          attributes = args[0];
        }
        mustUpdate = true;
      }

      // trigger the update function only if it's really needed
      if (mustUpdate) {
        this.update(attributes, 'set');
      }

      return this;
    },
    /**
     * Remove any property from the current class
     * @param { String } path: path to the value to remove
     * @public
     */
    unset: function(path) {

      var attributes = this.get();
      // update only if the nested property has been found
      if (path) {
        _.setObjectValueByPath(attributes, path, null);
      } else {
        attributes = undefined;
      }

      this.update(attributes, 'unset');

      return this;
    },
    /**
     * Reset the class attributes to its initial state
     * @public
     */
    reset: function() {
      this.update(this.__initialValues, 'reset');

      return this;
    },
    /**
     * Add new items into this class data if it's an array or otherwise
     * it can also add items to its internal properties
     * @param  { * } item
     * @param  { String } path
     * @param  { Number } at
     * @public
     */
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
    /**
     * Remove items from this class data if it's an array or otherwise
     * it removes items from its internal properties
     * @param  { * } item
     * @param  { String } path
     * @public
     */
    remove: function(item, path) {
      var array = _.isString(path) ? this.get(path) : this.get(),
        itemIndex;
      if (!_.isArray(array)) {
        throw new Error('You cannot remove data from an element that is not an array');
      } else {
        itemIndex = _.indexOf(array, item);

        if (!~itemIndex) throw new Error(JSON.stringify(item) + ' was not found in this array');

        array.splice(itemIndex, 1);

        if (path) {
          this.set(path, array);
        } else {
          this.update(array, 'remove');
        }
      }
      return this;
    },
    /**
     * Update this class attributes
     * @param { Object } attributes: new data to set
     * @public
     */
    update: function(attributes, method) {

      var validation = this.validate(attributes);
      // validate the data just passed
      if (validation !== true) {
        this.events.error(validation);
        return false;
      }

      attributes = this.parse(attributes);

      if (_.contains(['set', 'unset', 'reset', 'read', 'add', 'remove'], method)) {

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

      // export the attributes outside
      this.attributes = attributes;

      return this;

    },
    /**
     * Return a new instance of this class cloning its attributes
     * @return { Object } Butter.Data instance
     * @public
     */
    clone: function() {
      return new Butter.Data(this.get()).extend(this);
    },

    /**
     * Link this class to another of the same type
     * @public
     */
    bind: function(destination, sourcePath, destinationPath, doubleWay) {

      var self = this,
        _doubleWay = _.isUndefined(doubleWay) ? true : doubleWay;

      // Bind this class also to the source
      if (_doubleWay) {
        destination.listen(destinationPath).onValue(function(value) {
          self.set.apply(self, sourcePath ? [sourcePath, value] : [value]);
        });
      }

      this.listen(sourcePath).onValue(function(value) {
        destination.set.apply(destination, destinationPath ? [destinationPath, value] : [value]);
      });

      return this;

    },

    /**
     * Return a data changes stream only on a specific internal attribute of this class
     * @public
     */
    listen: function(path) {
      var initialValue,
        stream;

      if (path) {
        initialValue = this.get(path);
        stream = this.changes.map('.' + path);
      } else {
        initialValue = this.get();
        stream = this.changes;
      }

      return stream.startWith(initialValue)
        .skipWhile(function(value) {
          return _.isEqual(value, initialValue);
        })
        .skipDuplicates(_.isEqual);
    },

    /**
     * Return an events stream filtering only some of the events triggered by this class
     * @public
     */
    on: function(method) {
      return this.events.filter(function(event) {
        return (_.contains(method.split(' '), event));
      }).skipDuplicates();
    },

    /**
     * Switch the class state to a previous version
     * @public
     */
    undo: function() {
      if (this.__currentStateIndex > 0) {
        this._changeToState(--this.__currentStateIndex, 'undo');
      }

      return this;
    },
    /**
     * Update the class attributes canceling the effect of the undo method
     * @public
     */
    redo: function() {
      if (this.__currentStateIndex < this.maxStatesLength) {
        this._changeToState(++this.__currentStateIndex, 'redo');
      }

      return this;
    },
    /**
     * Destroy the class and stop its data streams
     * @public
     */
    destroy: function(options) {
      var requestStream,
        onModelDestroyed = _.bind(function() {
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

  module.exports = Data;

});