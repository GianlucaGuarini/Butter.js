# copy the dist folder inside the gh-pages folder
module.exports =
  dist:
    files: [
      {
        expand: true
        src:[
          'dist/**'
        ]
        dest: '_gh-pages/assets/'
      }
    ]
