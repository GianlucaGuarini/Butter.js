define(function(require) {
  var Butter = require('butter'),
    expect = require('chai').expect;

  describe('Core', function() {
    it('The Butter exsists and it\'s tasty', function() {
      expect(Butter).is.not.undefined;
    });
  });
});