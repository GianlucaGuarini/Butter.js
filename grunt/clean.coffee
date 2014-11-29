# Use this task to delete all the folders and the files you don't need anymore
# Some grunt tasks could create extra folders you want to remove
module.exports =
  build:
    src: ['dist']
  'pages':
    src: [
      '.grunt'
      '_gh-pages/node_modules'
      '_gh-pages/dist'
      '_gh-pages/examples'
    ]
  doc:
    src: [
      'docs'
    ]