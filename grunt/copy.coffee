# copy the dist folder inside the gh-pages folder
module.exports =
  dist:
    files: [
      {
        expand: true
        src:[
          'dist/**'
          'examples/**',
          'node_modules/jquery/**'
          'node_modules/baconjs/**'
        ]
        dest: '_gh-pages/'
      }
    ]
