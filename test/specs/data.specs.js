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
    });

    it('It can be created and setup correctly', function() {

      expect(food.state).to.be.an('array');
      expect(food.changes).to.be.a(Bacon.Bus);
      expect(food.events).to.be.a(Bacon.Bus);

      // get
      expect(food.get('name')).to.be.equal('bagel');
      expect(food.get('ingredients.sweet')).to.be.equal('sugar');
      expect(food.get('ingredients.secretIngredients.0.theyCallIt')).to.be.equal('love');
      expect(food.get('ingredients.sweet')).to.be.equal('sugar');

      // set
      food.set('mushroom', '1up');
      expect(food.get('mushroom')).to.be.equal('1up');
      food.set({
        mushroom: '1down',
        ingredients: 'nope'
      });
      expect(food.get('mushroom')).to.be.equal('1down');

      // unset
      food.unset('ingredients.secretIngredients');
      expect(food.get('secretIngredients')).to.be.undefined;
      expect(food.toString()).to.be.equal(JSON.stringify({
        name: 'bagel',
        ingredients: 'nope',
        mushroom: '1down'

      }));
      // reset
      food.reset();
      expect(food.toString()).to.be.equal(JSON.stringify(initialData));

    });

    it('Its listeners work as expected', function() {
      var callback = sinon.spy(),
        listenCallback = sinon.spy(),
        newSecretIngredient = {
          salt: 'notTooMuch'
        };

      food.changes.onValue(callback);

      food.listen('ingredients.secretIngredients').onValue(listenCallback);

      food.add(newSecretIngredient, 'ingredients.secretIngredients');

      expect(food.get('ingredients.secretIngredients.1')).to.be.equal(newSecretIngredient);
      expect(listenCallback).was.calledWith(food.get('ingredients.secretIngredients'));

      food.set('ingredients.secretIngredients', food.get('ingredients.secretIngredients'));

      food.set('name', 'delicious Italian food');

      food.reset();

      food.unset('ingredients.secretIngredients');

      expect(listenCallback).was.callCount(3);
      expect(callback).was.callCount(5);


    });

    it('Its states could be switched with the undo and redo methods', function() {
      this.timeout(10000);
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

    it('The undo and redo methods trigger also the status change events', function() {
      var callback = sinon.spy();
      food.events.onValue(callback);
      food.set('name', 'pasta');
      food.undo();
      food.redo();
      expect(callback).was.calledThrice();
    });

    it('The add and remove event work only with array data', function() {
      foods.add('pasta');
      foods.add('pane');
      foods.add('pizza', null, 1);
      expect(foods.length).to.be.equal(3);
      expect(foods.get('1')).to.be.equal('pizza');
    });

    it('The sync methods work with a JSON object', function(done) {
      this.timeout(10000);
      var callback = sinon.spy();
      food.url = window.FIXTURES_URL + 'object.json';
      food.events.onValue(callback);
      food.on('read').onValue(function() {
        expect(callback).was.calledOnce();
        expect(food.get('name')).to.be.equal('pizza');
        done();
      });
      expect(food.fetch()).to.be.an('object');

    });

    it('The sync methods work with a JSON array', function(done) {

      this.timeout(10000);
      var callback = sinon.spy();
      food.url = window.FIXTURES_URL + 'array.json';
      food.events.onValue(callback);
      food.on('read').onValue(function() {
        expect(callback).was.calledOnce();
        expect(food.get()).to.be.an('array');
        expect(food.get('length')).to.be.equal(2);
        done();
      });
      expect(food.fetch()).to.be.an('object');

    });

    it('The sync methods throw an error if no url is set', function() {
      expect(food.fetch).to.throwException();
      expect(food.save).to.throwException();
    });

    it('It can be returned as string', function() {
      expect(food.toString()).to.be.equal(JSON.stringify(initialData));
    });

    afterEach(function(done) {
      food.events.onEnd(done);
      food.destroy();
    });

  });
});