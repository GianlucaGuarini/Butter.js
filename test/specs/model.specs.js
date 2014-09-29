define(function(require) {
  var Butter = require('butter'),
    expect = require('chai').expect;

  describe('Model creation', function() {
    it('The model can be created correctly', function() {
      var model = new Butter.Model({
        data: 'myData',
        deepValue: {
          value: 'foo',
          collection: [{
            value: 'bar'
          }]
        }
      });
      expect(model).is.instanceof(Butter.Model);
      expect(model.get('data')).to.be.equal('myData');
      expect(model.get('deepValue.value')).to.be.equal('foo');
    });
  });
});