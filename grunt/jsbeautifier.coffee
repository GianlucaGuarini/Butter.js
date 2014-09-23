# Make it tasty!
module.exports = (grunt, options) =>
  dist:
    src: 'dist/Butter.js'
    options:
      js: grunt.file.readJSON('.jsbeautifyrc')