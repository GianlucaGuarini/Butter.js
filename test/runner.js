var karma = window.__karma__;

window.FIXTURES_URL = karma ? 'base/test/fixtures/' : 'fixtures/';

if (karma) {
  karma.loaded = function() {};
}

mocha.setup('bdd');

requirejs.config({
  baseUrl: karma ? 'base/src/' : '../src/'
});

var failedTests = [];

function logFailure(test, err) {

  var flattenTitles = function(test) {
    var titles = [];
    while (test.parent.title) {
      titles.push(test.parent.title);
      test = test.parent;
    }
    return titles.reverse();
  };

  failedTests.push({
    name: test.title,
    result: false,
    message: err.message,
    stack: err.stack,
    titles: flattenTitles(test)
  });
}

require([
  '../test/requirejs-config'
], function() {
  require([
    'baconjs',
    'jquery',
    'butter'
  ], function() {
    require([
      // tests
      '../test/specs/data.specs',
      '../test/specs/helpers.specs',
      '../test/specs/core.specs',
      '../test/specs/view.specs'
    ], function() {

      var runner;

      // terminal tests
      if (karma) {
        karma.start();
      } else {

        //browser
        runner = mocha.run();

        runner.on('end', function() {
          window.mochaResults = runner.stats;
          window.mochaResults.reports = failedTests;
        });

        runner.on('fail', logFailure);
      }
    });
  });
});