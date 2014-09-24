requirejs.config({
  paths: {
    'bacon': '../node_modules/bacon.model/node_modules/baconjs/dist/Bacon',
    'jquery': '../node_modules/jquery/dist/jquery'
  },
  map: {
    '*': {
      'baconjs': 'bacon'
    }
  }
});