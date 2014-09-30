var karma = window.__karma__;

requirejs.config({
  baseUrl: karma ? 'base/test/' : './',
  paths: {
    'chai': '../node_modules/chai/chai',
    'sinon': '../node_modules/sinon/pkg/sinon',
    'sinon-chai': '../node_modules/sinon-chai/lib/sinon-chai',
    simulant: '../node_modules/simulant/simulant',
    jquery: '../node_modules/jquery/dist/jquery',
    baconjs: '../node_modules/baconjs/dist/Bacon',
    butter: '../dist/Butter'
  },
  urlArgs: 'bust=' + (new Date()).getTime(),
  shim: {
    'sinon-chai': ['chai', 'sinon'],
    mocha: {
      exports: 'mocha'
    },
    chai: {
      exports: 'chai'
    }
  }
});

if (karma) {
  karma.loaded = function() {};
}


mocha.setup('bdd');

require([
  'specs/core.specs',
  'specs/model.specs'
], function() {

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