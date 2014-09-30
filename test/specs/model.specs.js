define(function(require) {
  var Model = require('Model'),
    chai = require('chai'),
    should = chai.should,
    expect = chai.expect,
    sinonChai = require('sinon-chai');

  chai.use(sinonChai);

  describe('Model creation get, set, reset, and unset methods', function() {
    var food;
    beforeEach(function() {
      food = new Model({
        tomatoes: 'myTomatoes',
        spices: {
          pepper: 'foo',
          secretIngredients: [{
            theyCallIt: 'love'
          }]
        }
      });
    });
    it('The food can be created and setup correctly', function() {

      expect(food.state).to.be.an('array');
      expect(food.changes).is.instanceof(Bacon.Bus);
      expect(food.events).is.instanceof(Bacon.Bus);

      // get
      expect(food.get('tomatoes')).to.be.equal('myTomatoes');
      expect(food.get('spices.pepper')).to.be.equal('foo');
      expect(food.get('spices.secretIngredients.0.theyCallIt')).to.be.equal('love');
      expect(food.get('spices.pepper')).to.be.equal('foo');

      // set
      food.set('mushroom', '1up');
      expect(food.get('mushroom')).to.be.equal('1up');
      food.set({
        mushroom: '1down',
        spices: 'nope'
      });
      expect(food.get('mushroom')).to.be.equal('1down');

      // unset
      food.unset('spices.secretIngredients');
      expect(food.get('secretIngredients')).to.be.undefined;
      expect(food.get()).to.deep.equal({
        tomatoes: 'myTomatoes',
        mushroom: '1down',
        spices: 'nope'
      });
      // reset
      food.reset();
      expect(food.get()).to.deep.equal({});

    });
    it('the food listeners work as expected', function() {
      var callback = sinon.spy(),
        listenCallback = sinon.spy(),
        deepsecretIngredients = food.get('spices.secretIngredients');

      food.changes.onValue(callback);
      food.listen('spices.secretIngredients').onValue(listenCallback);

      deepsecretIngredients.push({
        salt: 'notTooMuch'
      });
      food.set('spices.secretIngredients', deepsecretIngredients);
      expect(listenCallback).to.have.been.calledWith(food.get('spices.secretIngredients'));
      food.set('spices.secretIngredients', food.get('spices.secretIngredients'));

      food.set('name', 'delicious Italian food');
      food.reset({});

      expect(listenCallback).to.have.been.calledTwice;
      expect(callback).to.have.been.callCount(4);
    });
    afterEach(function() {
      food.destroy();
    });
  });
});