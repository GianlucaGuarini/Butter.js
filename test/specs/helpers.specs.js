define(function(require) {
  var _ = require('utils/helpers'),
    expect = require('expect'),
    sinon = require('sinon'),
    SinonExpect = require('sinon-expect');

  // extend expect adding the sinon methods
  expect = SinonExpect.enhance(expect, sinon, 'was');

  describe('Butter.helpers', function() {

    var cake,
      cakes = [];

    beforeEach(function() {
      cake = {
        ingredients: {
          meal: '00',
          sugar: true
        },
        prices: [{
          small: 300
        }, {
          big: 500
        }]
      };
      for (var i = 0; i < 1000; i++) {
        cakes.push(cake);
      }
    });

    it('getObjectValueByPath', function() {
      expect(_.getObjectValueByPath(cake, 'ingredients.meal')).to.equal('00');
      expect(_.getObjectValueByPath(cakes, '[300].ingredients.meal')).to.equal('00');
    });

    it('setObjectValueByPath', function() {
      _.setObjectValueByPath(cake, 'ingredients.sugar', false);
      _.setObjectValueByPath(cakes, '[20].ingredients.sugar', null);
      expect(cake.ingredients.sugar).to.equal(false);
      expect(cakes[20].ingredients.sugar).to.equal(undefined);
    });

    it('difference', function() {
      var bread = {
          prices: [{
            small: 300
          }, {
            big: 500
          }],
          pizzas: ['margherita', 'quattrostagioni', 'calzone'],
          specialOffer: true
        },
        fruits = ['mela', 'banana', 'pera'],
        cake2 = {
          ingredients: {
            meal: '00',
            sugar: true
          },
          prices: [{
            small: 300
          }, {
            big: 500
          }]
        },
        breads = [];

      expect(_.isEqual(_.difference(cake, bread), {
        ingredients: {
          meal: '00',
          sugar: true
        }
      })).to.equal(true);

      expect(_.isEqual(_.difference(cake, cake2), false)).to.equal(true);

      expect(_.isEqual(_.difference(fruits, bread), ['mela', 'banana', 'pera'])).to.equal(true);

      expect(_.isEqual(_.difference(bread, cake), {
        pizzas: ['margherita', 'quattrostagioni', 'calzone'],
        specialOffer: true
      })).to.equal(true);

    });
    it('keys', function() {
      var keys = _.keys(cake);
      expect(_.isEqual(keys, ['ingredients', 'prices'])).to.be(true);
    });
    it('isBoolean', function() {
      expect(_.isBoolean(true)).to.be(true);
      expect(_.isBoolean(false)).to.be(true);
      expect(_.isBoolean('false')).to.be(false);
      expect(_.isBoolean('true')).to.be(false);
      expect(_.isBoolean(/[a-z]/)).to.be(false);
      expect(_.isBoolean(null)).to.be(false);
      expect(_.isBoolean(undefined)).to.be(false);
      expect(_.isBoolean({})).to.be(false);
      expect(_.isBoolean([])).to.be(false);
      expect(_.isBoolean(1)).to.be(false);
      expect(_.isBoolean(0)).to.be(false);
      expect(_.isBoolean(Math.random)).to.be(false);
    });
    it('isObject', function() {
      expect(_.isObject(true)).to.be(false);
      expect(_.isObject(false)).to.be(false);
      expect(_.isObject('false')).to.be(false);
      expect(_.isObject('true')).to.be(false);
      expect(_.isObject(/[a-z]/)).to.be(false);
      expect(_.isObject(null)).to.be(false);
      expect(_.isObject(undefined)).to.be(false);
      expect(_.isObject({})).to.be(true);
      expect(_.isObject([])).to.be(false);
      expect(_.isObject(1)).to.be(false);
      expect(_.isObject(0)).to.be(false);
      expect(_.isObject(Math.random)).to.be(false);
    });
    it('isFunction', function() {
      expect(_.isFunction(true)).to.be(false);
      expect(_.isFunction(false)).to.be(false);
      expect(_.isFunction('false')).to.be(false);
      expect(_.isFunction('true')).to.be(false);
      expect(_.isFunction(/[a-z]/)).to.be(false);
      expect(_.isFunction(null)).to.be(false);
      expect(_.isFunction(undefined)).to.be(false);
      expect(_.isFunction({})).to.be(false);
      expect(_.isFunction([])).to.be(false);
      expect(_.isFunction(1)).to.be(false);
      expect(_.isFunction(0)).to.be(false);
      expect(_.isFunction(Math.random)).to.be(true);
    });
    it('isString', function() {
      expect(_.isString(true)).to.be(false);
      expect(_.isString(false)).to.be(false);
      expect(_.isString('false')).to.be(true);
      expect(_.isString('true')).to.be(true);
      expect(_.isString(/[a-z]/)).to.be(false);
      expect(_.isString(null)).to.be(false);
      expect(_.isString(undefined)).to.be(false);
      expect(_.isString({})).to.be(false);
      expect(_.isString([])).to.be(false);
      expect(_.isString(1)).to.be(false);
      expect(_.isString(0)).to.be(false);
      expect(_.isString(Math.random)).to.be(false);
    });
    it('isArray', function() {
      expect(_.isArray(true)).to.be(false);
      expect(_.isArray(false)).to.be(false);
      expect(_.isArray('false')).to.be(false);
      expect(_.isArray('true')).to.be(false);
      expect(_.isArray(/[a-z]/)).to.be(false);
      expect(_.isArray(null)).to.be(false);
      expect(_.isArray(undefined)).to.be(false);
      expect(_.isArray({})).to.be(false);
      expect(_.isArray([])).to.be(true);
      expect(_.isArray(1)).to.be(false);
      expect(_.isArray(0)).to.be(false);
      expect(_.isArray(Math.random)).to.be(false);
    });
    it('isRegExp', function() {
      expect(_.isRegExp(true)).to.be(false);
      expect(_.isRegExp(false)).to.be(false);
      expect(_.isRegExp('false')).to.be(false);
      expect(_.isRegExp('true')).to.be(false);
      expect(_.isRegExp(/[a-z]/)).to.be(true);
      expect(_.isRegExp(null)).to.be(false);
      expect(_.isRegExp(undefined)).to.be(false);
      expect(_.isRegExp({})).to.be(false);
      expect(_.isRegExp([])).to.be(false);
      expect(_.isRegExp(1)).to.be(false);
      expect(_.isRegExp(0)).to.be(false);
      expect(_.isRegExp(Math.random)).to.be(false);
    });
    it('isUndefined', function() {
      expect(_.isUndefined(true)).to.be(false);
      expect(_.isUndefined(false)).to.be(false);
      expect(_.isUndefined('false')).to.be(false);
      expect(_.isUndefined('true')).to.be(false);
      expect(_.isUndefined(/[a-z]/)).to.be(false);
      expect(_.isUndefined(null)).to.be(false);
      expect(_.isUndefined(undefined)).to.be(true);
      expect(_.isUndefined({})).to.be(false);
      expect(_.isUndefined([])).to.be(false);
      expect(_.isUndefined(1)).to.be(false);
      expect(_.isUndefined(0)).to.be(false);
      expect(_.isUndefined(Math.random)).to.be(false);
    });
    it('isEmpty', function() {
      expect(_.isEmpty({})).to.be(true);
      expect(_.isEmpty([])).to.be(true);
      expect(_.isEmpty([1, 2, 3])).to.be(false);
      expect(_.isEmpty({
        bar: 'foo'
      })).to.be(false);
    });
    it('isEqual', function() {
      expect(_.isEqual(true, true)).to.be(true);
      expect(_.isEqual(false, true)).to.be(false);
      expect(_.isEqual({}, {})).to.be(true);
      expect(_.isEqual({
        bar: 'foo'
      }, {
        bar: 'foo'
      })).to.be(true);
      expect(_.isEqual({
        bar: 'foo'
      }, {
        foo: 'bar'
      })).to.be(false);
      expect(_.isEqual([1, 2, 3], [1, 2, 3])).to.be(true);
      expect(_.isEqual([1, 2, 3], [1, 2, 4])).to.be(false);
      expect(_.isEqual('foo', 'foo')).to.be(true);
      expect(_.isEqual('bar', 'foo')).to.be(false);
    });
  });
});