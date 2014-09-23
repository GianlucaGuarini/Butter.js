requirejs.config({
  paths: {
    'bacon': '../node_modules/bacon.model/node_modules/baconjs/dist/Bacon',
    'bacon.model': '../node_modules/bacon.model/dist/bacon.model',
    'jquery': '../node_modules/jquery/dist/jquery',
    'lodash': '../node_modules/lodash/dist/lodash'
  },
  map: {
    '*': {
      'baconjs': 'bacon'
    }
  }
});