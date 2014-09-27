/**
 * @module Butter.Model
 */
Butter.Model = function(data) {
  /**
   * Private stuff
   * @private
   */
  var _currentStateIndex = -1;

  /**
   * @private
   */
  this._constructor = function() {

    Butter.helpers.extend(true, this, Butter.mixins);

    this.state = [];
    this.defaults = Butter.defaults.model;

    this.changes = new Bacon.Bus();
    if (Butter.helpers.isObject(data)) {
      this.set(data);
    }
  };
  /**
   * @public
   */
  this.toString = function() {
    return JSON.stringify(this.get());
  };
  /**
   * @public
   */
  this.get = function(attribute) {
    var currentState = this.state[_currentStateIndex],
      attributes;
    if (!currentState) {
      return {};
    }

    attributes = Butter.helpers.extend(true, {}, currentState.attributes);

    if (Butter.helpers.isString(attribute) && attributes[attribute]) {
      return attributes[attribute];
    } else if (!attribute) {
      return attributes;
    }
  };
  /**
   * @public
   */
  this.set = function(attributes) {

    var _attributes = this.get();

    if (Butter.helpers.isString(attributes) && arguments[1]) {
      Butter.helpers.changeValueByPath(attributes, arguments[1]);
    } else {
      Butter.helpers.each(attributes, function(key, value) {
        _attributes[key] = value;
      });
    }

    this.update(_attributes, 'set');

    return this;
  };
  /**
   * @public
   */
  this.unset = function(attributes) {

    var _attributes = this.get();

    Butter.helpers.each(attributes, function(key, value) {
      if (this.attributes[key]) {
        _attributes[key] = null;
        delete _attributes[key];
      }
    }, this);

    this.update(_attributes, 'unset');

    return this;
  };
  /**
   * @public
   */
  this.update = function(attributes, method) {

    this.changes.push(attributes);

    if (~Butter.helpers.indexOf(method, ['set', 'unset'])) {

      this.state.push({
        method: method,
        attributes: attributes
      });

      if (this.state.length > this.defaults.stateMaxLength + 1) {
        this.state.shift();
      }
      _currentStateIndex = this.state.length - 1;

    }

  };
  /**
   * @public
   */
  this.listen = function(path) {
    return this.changes.map('.' + path).skipDuplicates();
  };
  /**
   * @public
   */
  this.changeToState = function(index, method) {
    if (this.state[index]) {
      _currentStateIndex = index;
      this.update(this.state[index].attributes, method);
    }
  };
  /**
   * @public
   */
  this.undo = function() {
    if (_currentStateIndex > 0) {
      this.changeToState(--_currentStateIndex, 'undo');
    }
  };
  /**
   * @public
   */
  this.redo = function() {
    if (_currentStateIndex < this.defaults.stateMaxLength) {
      this.changeToState(++_currentStateIndex, 'redo');
    }
  };
  /**
   * @public
   */
  this.destroy = function() {
    this.changes.end();
    this.removeProperties();
  };

  this._constructor();

  return this;
};