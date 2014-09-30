# nodejs modules
fs = require('fs')
amdclean = require('amdclean');

module.exports = (grunt, options) =>

  # the main file without .js
  mainFile = 'Butter';
  # Get the script intro and outro strings
  banner = fs.readFileSync('src/frag/banner.frag','utf8')
                .replace(/@SCRIPT/g, options.pkg.name)
                .replace(/@VERSION/g, options.pkg.version)
  startFrag = fs.readFileSync('src/frag/start.frag','utf8')
                .replace(/@SCRIPT/g, options.pkg.name)
                .replace(/@VERSION/g, options.pkg.version)
  endFrag = fs.readFileSync('src/frag/end.frag','utf8')

  # common build options
  # they will be exrended below
  requirejsOptions =
    baseUrl: 'src'
    name: mainFile
    wrap: false
    # mainConfigFile: 'src/requirejs-config.js'
    preserveLicenseComments: false
    findNestedDependencies: true
    onModuleBundleComplete: (data) ->
      outputFile = data.path
      # use the amdclean to remove all the require functions
      # check the options https://github.com/gfranko/amdclean
      fs.writeFileSync outputFile, amdclean.clean(
        code: fs.readFileSync(outputFile)
        # wrap the output in a UMD (Universal Module Definition) pattern
        wrap:
          start: banner + '\n' + startFrag
          end: endFrag
        )
  # expanded release
  expanded:
    options: grunt.util._.extend({
        out: 'dist/' + options.pkg.name + '.js'
        optimize: 'none'
      }, requirejsOptions)
  # minified release
  min:
    options:
      grunt.util._.extend({
        out: 'dist/' + options.pkg.name + '.min.js'
        optimize: 'uglify2'
      }, requirejsOptions)