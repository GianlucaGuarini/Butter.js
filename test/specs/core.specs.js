define(function(require) {
  var Butter = require('butter');

  describe('Core:', function() {
    it('The Butter exsists and it\'s tasty', function() {
      expect(Butter).to.be.an('object');
    });
  });
});