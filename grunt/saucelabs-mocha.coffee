# crossbrowser testing
module.exports = (grunt, options) =>
  all:
    options:
      urls: [
        'http://127.0.0.1:9999/test/runner.html'
      ]
      username: 'butterjs'
      key: '4ca4ecba-e1b1-4572-bc02-8189387fc690'
      browsers: grunt.file.readJSON('test/saucelabs-browsers.json')
      build: process.env.TRAVIS_JOB_ID
      testname: options.pkg.name
      throttled: 3
      sauceConfig:
        'video-upload-on-pass': false


