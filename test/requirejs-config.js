requirejs.config({
  paths: {
    'sinon': '../node_modules/sinon/pkg/sinon',
    'sinon-expect': '../node_modules/sinon-expect/lib/sinon-expect',
    'expect': '../node_modules/expect.js/index',
    simulant: '../node_modules/simulant/simulant',
    jquery: '../node_modules/jquery/dist/jquery',
    baconjs: '../node_modules/baconjs/dist/Bacon',
    page: '../node_modules/page/page',
    butter: '../dist/Butter'
  },
  shim: {
    sinon: {
      exports: 'sinon'
    },
    expect: {
      exports: 'expect'
    },
    'sinon-expect': {
      deps: ['sinon', 'expect'],
      exports: 'SinonExpect'
    }
  },
  urlArgs: 'bust=' + (new Date()).getTime()
});