# generate the documentation automatically from the source files
module.exports =
  dist:
    src: 'dist/Butter.js'
    dest: 'docs/'
    options:
      contentsEnabled: false
      pathFilter: 'dist'