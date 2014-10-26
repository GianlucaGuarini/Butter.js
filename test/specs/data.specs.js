define(function(require) {
  var Data = require('Data'),
    expect = require('expect'),
    sinon = require('sinon'),
    SinonExpect = require('sinon-expect');

  // extend expect adding the sinon methods
  expect = SinonExpect.enhance(expect, sinon, 'was');

  describe('Butter.Data', function() {
    var food,
      foods,
      empty,
      initialData = {
        name: 'bagel',
        ingredients: {
          sweet: 'sugar',
          secretIngredients: [{
            theyCallIt: 'love'
          }]
        }
      };

    beforeEach(function() {
      food = new Data(initialData);
      foods = new Data([]);
      empty = new Data();
    });

    it('constructor', function() {

      expect(food.state).to.be.an('array');
      expect(food.changes).to.be.a(Bacon.Bus);
      expect(food.events).to.be.a(Bacon.Bus);

    });

    it('get', function() {

      expect(food.get('name')).to.be.equal('bagel');
      expect(food.get('ingredients.sweet')).to.be.equal('sugar');
      expect(food.get('ingredients.secretIngredients.0.theyCallIt')).to.be.equal('love');
      expect(food.get('ingredients.sweet')).to.be.equal('sugar');
      expect(empty.get()).to.be(undefined);

    });

    it('set', function() {

      food.set('mushroom', '1up');
      expect(food.get('mushroom')).to.be.equal('1up');
      food.set({
        mushroom: '1down',
        ingredients: 'nope'
      });
      empty.set('foo');
      expect(food.get('mushroom')).to.be.equal('1down');
      expect(empty.get()).to.be.equal('foo');

    });

    it('unset', function() {

      food.unset('ingredients.secretIngredients');
      expect(food.get('secretIngredients')).to.be(undefined);
      expect(food.toString()).to.be.equal(JSON.stringify({
        name: 'bagel',
        ingredients: {
          sweet: 'sugar'
        }
      }));

      empty.set('foo');
      empty.unset();
      expect(empty.get()).to.be(undefined);

    });

    it('reset', function() {

      food.set({
        mushroom: '1down',
        ingredients: 'nope'
      });

      food.reset();

      expect(food.toString()).to.be.equal(JSON.stringify(initialData));

      empty.set('foo');
      empty.reset();
      expect(empty.get()).to.be(undefined);


    });


    it('listen', function() {

      var callback = sinon.spy(),
        listenCallback = sinon.spy(),
        listenCallback2 = sinon.spy(),
        newSecretIngredient = {
          salt: 'notTooMuch'
        };

      food.changes.onValue(callback);

      food.listen('ingredients.secretIngredients').onValue(listenCallback);
      food.listen('ingredients.secretIngredients.0').onValue(listenCallback2);

      food.add(newSecretIngredient, 'ingredients.secretIngredients');

      expect(JSON.stringify(food.get('ingredients.secretIngredients.1'))).to.be.equal(JSON.stringify(newSecretIngredient));

      expect(listenCallback).was.calledWith(food.get('ingredients.secretIngredients'));
      expect(listenCallback2).was.callCount(0);

      food.set('ingredients.secretIngredients', food.get('ingredients.secretIngredients'));
      food.set('name', 'delicious Italian food');

      food.reset();

      food.unset('ingredients.secretIngredients');

      expect(listenCallback).was.callCount(3);
      expect(callback).was.callCount(5);

    });

    it('redo undo', function() {

      food.set('quantity', 4);
      expect(food.get('quantity')).to.be.equal(4);
      food.undo();
      expect(food.get('quantity')).to.be(undefined);

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

    it('bind', function() {

      var food2 = new Data(),
        food3 = new Data(initialData);
      food.bind(food2);
      food.set('name', 'pizza');
      expect(food2.get('name')).to.be.equal('pizza');
      food2.set('name', 'margherita');
      expect(food.get('name')).to.be.equal('margherita');

      food.set('extras', []);
      food3.bind(food, 'ingredients.secretIngredients', 'extras');
      food3.set('ingredients.secretIngredients.0.something', 'special');
      expect(food.get('extras.0.something')).to.be.equal('special');
      expect(food2.get('extras.0.something')).to.be.equal('special');
      food3.set('name', 'quattroformaggi');
      expect(food.get('name')).to.be.equal('margherita');
      expect(food2.get('name')).to.be.equal('margherita');

      food2.destroy();
      food3.destroy();

    });

    it('on', function() {

      var callback = sinon.spy();
      food.on('set undo redo').onValue(callback);
      food.set('name', 'pasta');
      food.undo();
      food.redo();
      expect(callback).was.calledThrice();

    });

    it('add', function() {

      foods.add('pasta');
      foods.add('pane');
      foods.add('pizza', null, 1);
      expect(foods).to.have.length(3);
      expect(foods.get('1')).to.be.equal('pizza');

    });

    it('remove', function() {

      foods.add('pasta');
      foods.add('pane');
      foods.add('pizza', null, 1);
      foods.remove('pasta');
      foods.remove('pizza');
      foods.remove('pane');
      food.remove({
        theyCallIt: 'love'
      }, 'ingredients.secretIngredients');
      expect(foods.remove).to.throwError();
      expect(foods).to.have.length(0);
      expect(food.get('ingredients.secretIngredients')).to.have.length(0);

    });

    it('fetch object', function(done) {

      var callback = sinon.spy();
      food.url = window.FIXTURES_URL + 'object.json';
      food.events.onValue(callback);
      food.on('read').onValue(function() {
        expect(callback).was.calledTwice();
        expect(food.get('name')).to.be.equal('pizza');
        done();
      });
      expect(food.fetch()).to.be.an('object');

    });

    it('fetch array', function(done) {

      var callback = sinon.spy();
      food.url = window.FIXTURES_URL + 'array.json';
      food.events.onValue(callback);
      food.on('read').onValue(function() {
        expect(callback).was.calledTwice();
        expect(food.get()).to.be.an('array');
        expect(food.get('length')).to.be.equal(2);
        done();
      });
      expect(food.fetch()).to.be.an('object');

    });

    it('sync errors', function(done) {

      expect(food.fetch).to.throwException();
      expect(food.save).to.throwException();

      food.events.onError(function() {
        done();
      });

      food.url = 'wrong-url';
      food.fetch({
        timeout: 1000
      });

    });

    it('toString', function() {

      expect(food.toString()).to.be.equal(JSON.stringify(initialData));

    });

    // it('errors', function() {

    // });

    afterEach(function() {
      food.url = null;
      food.destroy();
      empty.destroy();
    });

  });
});