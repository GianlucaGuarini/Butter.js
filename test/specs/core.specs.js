define(function(require) {

  var Butter = require('butter');

  describe('Core', function() {

    it('The Butter exsists and it\'s tasty', function() {
      expect(Butter).to.be.an('object');
    });

    it('Butter.create.View', function() {

      var view = Butter.create.View();
      expect(view).to.be.a(Butter.View);

    });

    it('Butter.create.Data', function() {

      var data = Butter.create.Data({
        bar: 'foo'
      });
      expect(data).to.be.a(Butter.Data);
      expect(data.get('bar')).to.be.equal('foo');

    });
  });
});