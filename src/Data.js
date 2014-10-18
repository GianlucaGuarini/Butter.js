define(function(require, exports, module) {
  'use strict';
  /**
   * @module Butter.Data
   */

  var _ = require('./utils/helpers'),
    defaults = require('./utils/defaults'),
    mixins = require('./utils/mixins');

  module.exports = function(initialValues) {
    /**
     * Private stuff
     * @private
     */
    var __currentStateIndex = 0,
      __initialValues = null;

    /**
     * @private
     */
    this._constructor = function() {
      // extend this class with the default mixins used for any Butter class
      _.extend(this, mixins);
      // getting some useful options shared between any Data class
      _.extend(this, defaults.data);
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
      if (_.isObject(initialValues) || _.isArray(initialValues)) {

        this.set(initialValues);
        __initialValues = this.get();
      }

      return this;
    };

    /**
     * Change this class data restoring them to a previous state
     * @private
     */
    this._changeToState = function(index, method) {
      if (this.state[index]) {
        __currentStateIndex = index;
        this.update(this.state[index].attributes, method);
      }

      return this;
    };
    /**
     * Return this class data as valid string
     * @public
     */
    this.toString = function() {
      return JSON.stringify(this.get());
    };
    /**
     * Get any value of this class by a path
     * If no path is specified we get all the class attributes
     * @param { String } path: the path to the attribute
     * @public
     */
    this.get = function(path) {

      var currentState = this.state[__currentStateIndex];
      // check if this class data have been set at least once
      // by checking its current state
      if (!currentState) {
        return {};
      } else if (_.isString(path)) {
        // get an internal property of this class
        return _.getObjectValueByPath(currentState.attributes, path);
      } else {
        // return the all class attributes by cloning them in a new object
        return _.clone(currentState.attributes);
      }
    };
    /**
     * Parse the data sent to this class
     * @param  { Object|Array } data
     * @return { Object|Array }
     */
    this.parse = function(data) {
      return data;
    };
    /**
     * Validate the data sent to this class
     * if it returns false this data will not set
     * @param  { Object|Array } data
     * @return { Boolean }
     */
    this.validate = function(data) {
      return true;
    };
    /**
     * Return the difference between the current state of the class and the previous one
     * @return { Object|Array }
     */
    this.changedAttributes = function() {
      if (this.maxStatesLength > 2 && __currentStateIndex) {
        return _.difference(this.state[__currentStateIndex - 1].attributes, this.get());
      } else {
        return this.get();
      }
    };
    /**
     * Method used to sync the class data with any server via ajax
     * TODO: clean up the code in this function
     * @param  { String } method: 'save', 'read', 'delete'
     * @param  { Object } options: custom $.ajax options
     * @return { Object } jQuery promise
     */
    this.sync = function(method, options) {

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

      this.isNew = false;
      ajax = $.ajax(_.extend({
        url: this.url,
        type: this.emulateHTTP ? (httpVerb === 'GET' ? 'GET' : 'POST') : httpVerb,
        data: httpVerb === 'GET' ? null : JSON.stringify(data),
        dataType: 'json'
      }, options));

      ajax.then(
        _.bind(function(data) {
          if (httpVerb === 'GET') {
            this.update(data, 'read');
          } else {
            this.events.push(method);
          }
        }, this),
        _.bind(this.events.error, this),
        _.bind(this.events.push, this, 'sync')
      );
      return ajax;
    };
    /**
     * Get the data directly from the server
     * @param  { Object } options: jquery ajax oprions
     * @return { Bacon.EventStream }
     */
    this.fetch = function(options) {
      return this.sync('read', options);
    };
    /**
     * Save the current dataset on the server
     * @param  { Object } options: jquery ajax oprions
     * @return { Bacon.EventStream }
     */
    this.save = function(options) {
      return this.sync('save', options);
    };
    /**
     * Set/Update the data managed by this class
     * selecting a deep property or just using an object
     * @param { Object|String } : path to a deep value to update or object to set/update
     * @param { * } : in case of a path for a deep update here you can set the new property
     * @public
     */
    this.set = function() {
      // get all the current class attributes
      var attributes = this.get(),
        // assuming we don't need to update this
        mustUpdate = false;

      // do we need to update a deep property?
      if (_.isString(arguments[0])) {
        // update the deep value or return false
        mustUpdate = _.setObjectValueByPath(attributes, arguments[0], arguments[1]);
      } else {

        // update or add new values
        if (_.isObject(attributes)) {
          _.extend(attributes, arguments[0]);
        } else {
          attributes = arguments[0];
        }
        mustUpdate = true;
      }

      // trigger the update function only if it's really needed
      if (mustUpdate) {
        this.update(attributes, 'set');
      }

      return this;
    };
    /**
     * Remove any property from the current class
     * @param { String } path: path to the value to remove
     * @public
     */
    this.unset = function(path) {

      var attributes = this.get();
      // update only if the nested property has been found
      if (path && _.setObjectValueByPath(attributes, path, null)) {
        this.update(attributes, 'unset');
      }

      return this;
    };
    /**
     * Reset the class attributes to its initial state
     * @public
     */
    this.reset = function() {
      this.update(__initialValues, 'reset');

      return this;
    };
    /**
     * Add new items into this class data if it's an array or otherwise
     * it can also add items to its internal properties
     * @param  { * } item
     * @param  { String } path
     * @param  { Number } at
     * @public
     */
    this.add = function(item, path, at) {
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
    };
    /**
     * Remove items from this class data if it's an array or otherwise
     * it removes items from its internal properties
     * @param  { * } item
     * @param  { String } path
     * @public
     */
    this.remove = function(item, path) {
      var array = _.isString(path) ? this.get(path) : this.get(),
        itemIndex;
      if (!_.isArray(array)) {
        throw new Error('You cannot remove data from an element that is not an array');
      } else {
        itemIndex = _.indexOf(item, array);
        if (!~itemIndex) throw new Error(JSON.stringify(item) + ' was not found in this array');
        array = array.splice(itemIndex, 1);
        if (path) {
          this.set(path, array);
        } else {
          this.update(array, 'remove');
        }
      }
      return this;
    };
    /**
     * Update this class attributes
     * @param { Object } attributes: new data to set
     * @public
     */
    this.update = function(attributes, method) {



      var validation = this.validate(attributes);
      // validate the data just passed
      if (validation !== true) {
        this.events.error(validation);
        return false;
      }

      attributes = this.parse(attributes);

      this.changes.push(attributes);

      if (_.contains(['set', 'unset', 'reset', 'read', 'add', 'remove'], method)) {

        this.state.push({
          method: method,
          attributes: attributes
        });

        if (this.state.length > this.maxStatesLength + 1) {
          this.state.shift();
        }
        __currentStateIndex = this.state.length - 1;

      }



      this.events.push(method);

      return this;

    };
    /**
     * Return a new instance of this class cloning its attributes
     * @return { Object } Butter.Data instance
     * @public
     */
    this.clone = function() {
      return new Butter.Data(this.get()).extend(this);
    };

    /**
     * Link this class to another of the same type
     * @public
     */
    this.bind = function(destination, sourcePath, destinationPath, doubleWay) {

      var _doubleWay = _.isUndefined(doubleWay) ? true : doubleWay;

      var updateData = function(value) {
        if (destinationPath) {
          destination.set(destinationPath, value);
        } else {
          destination.set(value);
        }
      };
      if (sourcePath) {
        this.listen(sourcePath).onValue(updateData);
      } else {
        this.changes.skipDuplicates(_.isEqual).onValue(updateData);
      }

      // Bind this class also to the source
      if (_doubleWay) {
        destination.bind(this, destinationPath, sourcePath, false);
      }

      return this;

    };

    /**
     * Return a data changes stream only on a specific internal attribute of this class
     * @public
     */
    this.listen = function(path) {
      return this.changes.map('.' + path)
        .skipDuplicates(_.isEqual);
    };

    /**
     * Return an events stream filtering only some of the events triggered by this class
     * @public
     */
    this.on = function(method) {
      return this.events.filter(function(event) {
        return (_.contains(method.split(' '), event));
      }).skipDuplicates();
    };

    /**
     * Switch the class state to a previous version
     * @public
     */
    this.undo = function() {
      if (__currentStateIndex > 0) {
        this._changeToState(--__currentStateIndex, 'undo');
      }

      return this;
    };
    /**
     * Update the class attributes canceling the effect of the undo method
     * @public
     */
    this.redo = function() {
      if (__currentStateIndex < this.maxStatesLength) {
        this._changeToState(++__currentStateIndex, 'redo');
      }

      return this;
    };
    /**
     * Destroy the class and stop its data streams
     * @public
     */
    this.destroy = function(options) {
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
    };

    // initialize this class
    return this._constructor();

  };
});