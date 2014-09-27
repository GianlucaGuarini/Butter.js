# Make it tasty!
module.exports = (grunt, options) =>
  dist:
    options:
      banner: options.banner
    src: 'dist/Butter.js'
    dest: 'dist/Butter.min.js'
