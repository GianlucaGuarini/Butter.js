# generate automatically the bower.json file
module.exports =
  dist:
    dest: 'bower.json'
    options:
      'name': 'Butter.js',
      'main': 'dist/Butter.js',
      'version': '<%= pkg.version %>',
      'homepage': '<%= pkg.homepage %>',
      'authors': [
        '<%= pkg.author %>'
      ],
      'dependencies': '<%= pkg.dependencies %>',
      'description': '<%= pkg.description %>',
      'keywords': '<%= pkg.keywords %>',
      'license': '<%= pkg.license %>',
      'ignore': [
        '**/.*',
        '.*',
        'node_modules',
        'test',
        '_gh_pages',
        'grunt'
        'logos'
      ]