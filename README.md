#![Butter.js logo](https://raw.githubusercontent.com/bagel-framework/Butter.js/master/logos/logo.png)

MVW - Functional Reactive Progamming Javascript Framework build with [Bacon.js](https://github.com/baconjs/bacon.js)

__Work in progress... stay tuned!__

[![Build Status][travis-image]]([travis-url])
[![Coverage Status][coveralls-image]][coveralls-url]

[![Dependency Status][gemnasium-image]][gemnasium-url]
[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]

[![MIT License][license-image]][license-url]

<a href="https://saucelabs.com/u/butter" target="_blank">
	<img width="100%" alt="Sauce Test Status" src="https://saucelabs.com/browser-matrix/butter.svg" />
</a>

# Documentation

## Butter.View

The Butter.View class keeps your DOM elements always in sync with your application data.

```html

<ul id="toast">
  <li data-each="ingredients as ingredient">
    <span data-text="ingredient"></span>
  </li>
</ul>

```

```javascript

var view = new Butter.View({
	el: '#toast',
	data: {
      ingredients: [
        "butter",
        "marmalade"
      ]
    }
});

view.render();

```

## Butter.Data

# What is the Functional Reactive Programming?!
If you don't know what it is the "Functional Reactive Programming" paradigm please check the following video first:

[![An Introduction to Functional Reactive Programming](http://img.youtube.com/vi/ZOCCzDNsAtI/hqdefault.jpg)](https://www.youtube.com/watch?v=ZOCCzDNsAtI)

[npm-url]: https://npmjs.org/package/butter
[npm-version-image]: http://img.shields.io/npm/v/butter.svg?style=flat-square
[npm-downloads-image]: http://img.shields.io/npm/dm/butter.svg?style=flat-square

[coveralls-image]:https://img.shields.io/coveralls/bagel-framework/Butter.js.svg?style=flat-square
[coveralls-url]:https://coveralls.io/r/bagel-framework/Butter.js

[gemnasium-image]: https://img.shields.io/gemnasium/bagel-framework/Butter.js.svg?style=flat-square
[gemnasium-url]: https://gemnasium.com/bagel-framework/Butter.js

[travis-url]:https://travis-ci.org/bagel-framework/Butter.js.svg?branch=master
[travis-image]: https://img.shields.io/travis/bagel-framework/Butter.js.svg?style=flat-square

[license-url]: LICENSE
[license-image]: http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square



