var karma = window.__karma__;

if (karma) {
  karma.loaded = function() {};
}

mocha.setup('bdd');

requirejs.config({
  baseUrl: karma ? 'base/src/' : '../src/'
});

require([
  '../test/requirejs-config'
], function() {

  require([
    // tests
    '../test/specs/core.specs',
    '../test/specs/data.specs'
  ], function() {

    var runner;

    // terminal tests
    if (karma) {
      karma.start();
    } else {
      //browser
      runner = mocha.run();

      var failedTests = [];

      runner.on('end', function() {
        window.mochaResults = runner.stats;
        window.mochaResults.reports = failedTests;
      });

      runner.on('fail', logFailure);

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
      };
    }

  });
});