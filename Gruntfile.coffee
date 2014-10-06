module.exports = (grunt) ->

  fs = require('fs');
  # load all the grunt plugins
  require('load-grunt-tasks') grunt

  pkg = grunt.file.readJSON('package.json')

  # load all the grunt tasks defined in the grunt folder
  tasks = require('load-grunt-configs')(grunt,
    config:
      src: [
        'grunt/*.coffee'
        'grunt/*.js'
      ]
    pkg: pkg
    now: new Date().getTime()
  )

  # configure grunt passing our custom tasks
  grunt.initConfig tasks

  # build just the javascript files exporting them in the dist folder
  grunt.registerTask 'build', [
    'jshint'
    'requirejs'
    'jsbeautifier'
  ]

  # build and test the output
  grunt.registerTask 'test', [
    'build'
    'karma:run'
    'coveralls'
    'connect'
    'saucelabs-mocha'
  ]

  # update the project gh-pages
  grunt.registerTask 'pages', [
    'default'
    'markdown'
    'copy'
    'compass'
    'gh-pages'
    'clean:gh-pages'
  ]

  grunt.registerTask 'doc', [
    'clean:doc'
    # 'jsdox'
  ]

  # Default task. to make a new release
  grunt.registerTask 'default', [
    'clean:build'
    'build'
    'karma'
    'doc'
  ]

  return