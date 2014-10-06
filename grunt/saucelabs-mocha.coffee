# crossbrowser testing
module.exports = (grunt, options) =>
  all:
    options:
      urls: [
        'http://127.0.0.1:9999/test/runner.html'
      ]
      username: 'butter'
      key: 'a34e8565-616a-4dc2-9869-7c441d9ad674'
      browsers: grunt.file.readJSON('test/saucelabs-browsers.json')
      build: process.env.TRAVIS_JOB_ID
      testname: options.pkg.name
      throttled: 3
      sauceConfig:
        'video-upload-on-pass': false


