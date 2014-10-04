define(function(require, exports, module) {
  'use strict';
  /**
   * @module Butter.Model
   */

  var _ = require('./utils/helpers'),
    defaults = require('./utils/defaults'),
    mixins = require('./utils/mixins');

  module.exports = function(initialData) {
    /**
     * Private stuff
     * @private
     */
    var __currentStateIndex = 0,
      __initialData = {};

    /**
     * @private
     */
    this._constructor = function() {
      // extend this class with the default mixins used for any Butter class
      _.extend(true, this, mixins);
      // getting some useful options shared between any model class
      _.extend(true, this, defaults.model);
      // this array will contain all the data changes of this model
      // its max length is specified in the Butter.defaults.model
      this.state = [];
      // creating the changes stream that could be listened from the outside
      this.changes = new Bacon.Bus();
      // other stream that could be listened to check all the events triggered by this model
      this.events = new Bacon.Bus();
      // set the initial data
      if (_.isObject(initialData)) {
        this.set(initialData);
        __initialData = this.get();
      }
      return this;
    };

    /**
     * Change this model data restoring them to a previous state
     * @private
     */
    this._changeToState = function(index, method) {
      if (this.state[index]) {
        __currentStateIndex = index;
        this.update(this.state[index].attributes, method);
      }
    };
    /**
     * Return this model data as valid string
     * @public
     */
    this.toString = function() {
      return JSON.stringify(this.get());
    };
    /**
     * Get any value of the model by a path
     * If no path is specified we get all the model attributes
     * @param { String } path: the path to the model attribute
     * @public
     */
    this.get = function(path) {
      var currentState = this.state[__currentStateIndex];
      // check if this model has been set at least once
      // by checking its current state
      if (!currentState) {
        return {};
      } else if (_.isString(path)) {
        // get an internal property of this model
        return _.getObjectValueByPath(currentState.attributes, path);
      } else {
        // return the all model attributes by cloning them in a new object
        return _.extend(true, {}, currentState.attributes);
      }
    };
    /**
     * Set/Update the data managed by this model
     * selecting a deep property or just using an object
     * @param { Object|String } : path to a deep value to update or object to set/update
     * @param { * } : in case of a path for a deep update here you can set the new property
     * @public
     */
    this.set = function() {

      // get all the current model attributes
      var attributes = this.get(),
        // assuming we don't need to update this
        mustUpdate = false;

      // do we need to update a deep property?
      if (_.isString(arguments[0])) {
        // update the deep value or return false
        mustUpdate = _.setObjectValueByPath(attributes, arguments[0], arguments[1]);
      } else {
        // update or add new values
        _.each(arguments[0], function(key, value) {
          attributes[key] = value;
        });
        mustUpdate = true;
      }

      // trigger the update function only if it's really needed
      if (mustUpdate) {
        this.update(attributes, 'set');
      }

      return this;
    };
    /**
     * Remove any property from the current model
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
     * Reset the model to its initial state
     * @public
     */
    this.reset = function() {
      this.update(__initialData, 'reset');

      return this;
    };
    /**
     * Update this model attributes
     * @param { Object } attributes: new data to set
     * @public
     */
    this.update = function(attributes, method) {

      this.changes.push(attributes);
      this.events.push(method);

      if (~_.indexOf(method, ['set', 'unset', 'reset'])) {

        this.state.push({
          method: method,
          attributes: attributes
        });

        if (this.state.length > this.maxStatesLength + 1) {
          this.state.shift();
        }
        __currentStateIndex = this.state.length - 1;

      }

    };

    /**
     * Link this model to another
     * @public
     */
    this.bind = function(destination, sourcePath, destinationPath, doubleWay) {

      var _doubleWay = _.isUndefined(doubleWay) ? true : doubleWay;

      var updateModel = function(value) {
        if (destinationPath) {
          destination.set(destinationPath, value);
        } else {
          destination.set(value);
        }
      };
      if (sourcePath) {
        this.listen(sourcePath).onValue(updateModel);
      } else {
        this.changes.skipDuplicates(_.isEqual).onValue(updateModel);
      }

      // Bind this model also to the source
      if (_doubleWay) {
        destination.bind(this, destinationPath, sourcePath, false);
      }

    };

    /**
     * Return a changes stream only a specific internal attribute of this model
     * @public
     */
    this.listen = function(path) {
      return this.changes.map('.' + path)
        .skipDuplicates(_.isEqual);
    };

    /**
     * Switch the model state to a previous version
     * @public
     */
    this.undo = function() {
      if (__currentStateIndex > 0) {
        this._changeToState(--__currentStateIndex, 'undo');
      }
    };
    /**
     * Update the model data canceling the effect of the undo method
     * @public
     */
    this.redo = function() {
      if (__currentStateIndex < this.maxStatesLength) {
        this._changeToState(++__currentStateIndex, 'redo');
      }
    };
    /**
     * Destroy the model and stop its data streams
     * @public
     */
    this.destroy = function() {
      this.changes.end();
      this.events.end();
      this.removeProperties();
    };

    // initialize this class
    return this._constructor();

  };
});