define(function(require) {
  var View = require('View'),
    _ = require('utils/helpers'),
    Butter = require('butter'),
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

    it('all its events get created', function() {

      view = new View();
      view.render();
      expect(view.data.get()).to.be.an('object');
      expect(view.data).to.be.a(Butter.Data);
      expect(view.destroyDataOnRemove).to.equal(true);
      expect(_.isEmpty(view.data.get())).to.equal(true);
      expect(view.$el.length).to.equal(1);

    });

    it('it could accept also a Butter.Data instance', function() {

      var data = new Butter.Data();
      view = new View({
        data: data
      });
      data.set({
        iAm:'butter'
      });
      expect(view.destroyDataOnRemove).to.equal(false);
      expect(_.isEqual(view.data,data)).to.equal(true);

    });

    it('setData', function() {

      view = new View();
      view.setData([]);
      expect(view.data).to.be.a(Butter.Data);
      expect(view.data.length).to.equal(0);
      expect(_.isEmpty(view.data.get())).to.be(true);

    });

    it('setElement', function() {

      view = new View();
      view.setElement('#testView');
      view.render();
      expect(view.$el.attr('id')).to.equal('testView');

    });

    afterEach(function() {

      view.remove();

    });

  });
});