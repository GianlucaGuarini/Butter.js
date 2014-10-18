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
      expect(_.getObjectValueByPath(cake, 'ingredients.meal')).to.be.equal('00');
      expect(_.getObjectValueByPath(cakes, '[300].ingredients.meal')).to.be.equal('00');
    });

    it('setObjectValueByPath', function() {
      _.setObjectValueByPath(cake, 'ingredients.sugar', false);
      _.setObjectValueByPath(cakes, '[20].ingredients.sugar', null);
      expect(cake.ingredients.sugar).to.be.equal(false);
      expect(cakes[20].ingredients.sugar).to.be.equal(undefined);
    });

    it('difference', function() {
      var bread = {
          prices: [{
            small: 300
          }, {
            big: 500
          }],
          specialOffer: true
        },
        breads = [];

      expect(_.isEqual(_.difference(cake, bread), {
        ingredients: {
          meal: '00',
          sugar: true
        }
      })).to.be.equal(true);


      expect(_.isEqual(_.difference(bread, cake), {
        specialOffer: true
      })).to.be.equal(true);

    });
  });
});