# lint the javascript files
module.exports =
  all: [
    'src/**/*.js'
  ]
  options:
  	jshintrc: '.jshintrc'