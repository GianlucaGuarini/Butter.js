define(function(require) {
  var View = require('View'),
    expect = require('expect'),
    sinon = require('sinon'),
    SinonExpect = require('sinon-expect');

  // extend expect adding the sinon methods
  expect = SinonExpect.enhance(expect, sinon, 'was');

  describe('View:', function() {
    var view,
      $el;
    beforeEach(function() {
      $el = $('<div>');
      $('body').append($el);
    });
    it('All its events get created', function() {
      view = new View();
      view.render();
      expect(view.$el.length).to.be.equal(1);
    });
    afterEach(function() {
      view.remove();
    });
  });
});