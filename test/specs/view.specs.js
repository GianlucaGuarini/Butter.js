define(function(require) {
  var View = require('View'),
    _ = require('utils/helpers'),
    expect = require('expect'),
    sinon = require('sinon'),
    SinonExpect = require('sinon-expect');

  // extend expect adding the sinon methods
  expect = SinonExpect.enhance(expect, sinon, 'was');

  describe('Butter.View', function() {
    var view,
      $el;
    beforeEach(function() {
      $el = $('<div id="testView">');
      $('body').append($el);
    });
    it('All its events get created', function() {
      view = new View();
      view.render();
      expect(view.data.get()).to.be.an('object');
      expect(view.data).to.be.a(Butter.Data);
      expect(_.isEmpty(view.data.get())).to.be(true);
      expect(view.$el.length).to.be.equal(1);
    });
    it('setData', function() {
      view = new View();
      view.setData([]);
      expect(view.data).to.be.a(Butter.Data);
      expect(view.data.length).to.be.equal(0);
      expect(_.isEmpty(view.data.get())).to.be(true);
    });
    it('setElement', function() {
      view = new View();
      view.setElement('#testView');
      view.render();
      expect(view.$el.attr('id')).to.be.equal('testView');
    });
    afterEach(function() {
      view.remove();
    });
  });
});