module.exports =
  options:
    basePath: process.cwd()
    singleRun: true
    captureTimeout: 7000
    autoWatch: true
    captureConsole: true
    browsers: ['PhantomJS']
    preprocessors:
      'dist/Butter.js':'coverage'

    coverageReporter:
      type: 'lcov'
      dir: 'test/coverage'

    reporters: [
      'coverage'
      'progress'
    ]

    # Change this to the framework you want to use.
    frameworks: ['mocha-debug','mocha']
    plugins: [
      'karma-mocha'
      'karma-mocha-debug'
      'karma-phantomjs-launcher'
      'karma-coverage'
    ]


    # You can optionally remove this or swap out for a different expect.
    files: [{
      pattern: 'node_modules/requirejs/require.js'
    }
    {
      pattern:'node_modules/chai/chai.js'
      included: false
    }
    {
      pattern:'node_modules/sinon/lib/sinon.js'
      included: false
    }
    {
      pattern:'node_modules/sinon-chai/lib/sinon-chai.js'
      included: false
    }
    {
      pattern:'node_modules/simulant/simulant.js'
      included: false
    }
    {
      pattern:'node_modules/jquery/dist/jquery.js'
      included: false
    }
    {
      pattern:'node_modules/baconjs/dist/Bacon.js'
      included: false
    }
    {
      pattern:'dist/**/*.js'
      included: false
    }
    {
      pattern:'test/specs/**/*.js'
      included: false
    }
    {
      pattern:'test/runner.js'
    }]


  # This creates a server that will automatically run your tests when you
  # save a file and display results in the terminal.
  daemon:
    options:
      singleRun: false


  # This is useful for running the tests just once.
  run:
    options:
      singleRun: true
