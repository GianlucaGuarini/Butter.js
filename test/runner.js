var karma = window.__karma__;

requirejs.config({
  baseUrl: karma ? 'base/src/' : '../src/',
  paths: {
    'sinon': '../node_modules/sinon/pkg/sinon',
    'sinon-expect': '../node_modules/sinon-expect/lib/sinon-expect',
    'expect': '../node_modules/expect.js/index',
    simulant: '../node_modules/simulant/simulant',
    jquery: '../node_modules/jquery/dist/jquery',
    baconjs: '../node_modules/baconjs/dist/Bacon',
    butter: '../dist/Butter'
  },
  shim: {
    'sinon-expect': ['sinon', 'expect']
  },
  urlArgs: 'bust=' + (new Date()).getTime()
});

if (karma) {
  karma.loaded = function() {};
}


mocha.setup('bdd');

require([
  'jquery',
  'baconjs',
  'expect',
  'sinon-expect'
], function() {
  require([
    '../test/specs/core.specs',
    '../test/specs/data.specs'
  ], function() {

    //enhance expect adding the sinon methods
    window.expect = SinonExpect.enhance(expect, sinon, 'was');

    var runner;

    // terminal tests
    if (karma) {
      karma.start();
    } else {
      // browsers
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

      runner = mocha.run();

      runner.on('end', function() {
        window.mochaResults = runner.stats;
        window.mochaResults.reports = failedTests;
      });

      runner.on('fail', logFailure);
    }

  });
});