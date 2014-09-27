fs = require('fs')

module.exports = (grunt, options) =>
  # Get the script intro and outro strings
  startFrag = fs.readFileSync('src/frag/start.frag','utf8')
                .replace(/@SCRIPT/g, options.pkg.name)
                .replace(/@VERSION/g, options.pkg.version)
  endFrag = fs.readFileSync('src/frag/end.frag','utf8')

  bundle:
    options:
      banner: options.banner + '\n' + startFrag,
      footer: endFrag
    src: [
      'src/Butter.js'
      'src/utils/defaults.js'
      'src/utils/binders.js'
      'src/utils/mixins.js'
      'src/utils/helpers.js'
      'src/Model.js'
      'src/View.js'
    ]
    dest: 'dist/Butter.js'