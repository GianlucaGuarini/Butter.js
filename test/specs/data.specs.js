define(function(require) {
  var Data = require('Data'),
    chai = require('chai'),
    should = chai.should,
    expect = chai.expect,
    sinonChai = require('sinon-chai');

  chai.use(sinonChai);

  describe('Data:', function() {
    var food,
      initialData = {
        tomatoes: 'myTomatoes',
        spices: {
          pepper: 'hot',
          secretIngredients: [{
            theyCallIt: 'love'
          }]
        }
      };
    beforeEach(function() {
      food = new Data(initialData);
    });
    it('It can be created and setup correctly', function() {

      expect(food.state).to.be.an('array');
      expect(food.changes).is.instanceof(Bacon.Bus);
      expect(food.events).is.instanceof(Bacon.Bus);

      // get
      expect(food.get('tomatoes')).to.be.equal('myTomatoes');
      expect(food.get('spices.pepper')).to.be.equal('hot');
      expect(food.get('spices.secretIngredients.0.theyCallIt')).to.be.equal('love');
      expect(food.get('spices.pepper')).to.be.equal('hot');

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
      expect(food.get()).to.deep.equal(initialData);

    });
    it('Its listeners work as expected', function() {
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

      food.reset();

      food.unset('spices.secretIngredients');

      expect(listenCallback).to.have.been.callCount(3);
      expect(callback).to.have.been.callCount(5);


    });
    it('Its states could be switched with the undo and redo methods', function() {
      food.set('quantity', 4);
      expect(food.get('quantity')).to.be.equal(4);
      food.undo();
      expect(food.get('quantity')).to.be.undefined;

      var oldquantity,
        i,
        j;

      // check if the state limit is working properly
      for (i = 0; i <= 30; i++) {
        food.set('quantity', i);
      }

      oldquantity = food.get('quantity');
      i = food.get('quantity');
      j = food.maxStatesLength;

      while (j--) {
        food.undo();
        expect(food.get('quantity')).to.be.equal(--i);
      }

      food.undo();
      food.undo();
      food.undo();

      expect(food.get('quantity')).to.be.equal(oldquantity - food.maxStatesLength);

      j = food.maxStatesLength;
      i = food.get('quantity');
      oldquantity = food.get('quantity');

      while (j--) {
        food.redo();
        expect(food.get('quantity')).to.be.equal(++i);
      }

      food.redo();
      food.redo();
      food.redo();

      expect(food.get('quantity')).to.be.equal(oldquantity + food.maxStatesLength);

    });
    it('It can be bound to another model', function() {
      var food2 = new Data(),
        food3 = new Data(initialData);
      food.bind(food2);
      food.set('name', 'pizza');
      expect(food2.get('name')).to.be.equal('pizza');
      food2.set('name', 'margherita');
      expect(food.get('name')).to.be.equal('margherita');

      food.set('extras', []);
      food3.bind(food, 'spices.secretIngredients', 'extras');
      food3.set('spices.secretIngredients.0.something', 'special');
      expect(food.get('extras.0.something')).to.be.equal('special');
      expect(food2.get('extras.0.something')).to.be.equal('special');
      food3.set('name', 'quattroformaggi');
      expect(food.get('name')).to.be.equal('margherita');
      expect(food2.get('name')).to.be.equal('margherita');

    });
    it('The undo and redo methods trigger also the status change events', function() {
      var callback = sinon.spy();
      food.events.onValue(callback);
      food.set('name', 'pasta');
      food.undo();
      food.redo();
      expect(callback).to.have.been.calledThrice;
    });
    it('It can be returned as string', function() {
      expect(food.toString()).to.be.equal(JSON.stringify(initialData));
    });

    afterEach(function() {
      var callback = sinon.spy();
      food.events.onEnd(callback);
      food.destroy();
      expect(callback).to.have.been.calledOnce;
    });

  });
});