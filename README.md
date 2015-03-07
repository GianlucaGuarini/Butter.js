### IMPORTANT: Looking for a maintainer! 

Butter.js was a work in progress project and it's not yet ready for any kind of project. While [I](https://github.com/GianlucaGuarini) was working on it I found that Baconjs has [big memory issues](https://github.com/baconjs/bacon.js/issues/446#issuecomment-66687574) that cannot be easily solved. Currently I am one of the [riotjs](https://github.com/muut/riotjs) developers and I will not maintain this project anymore.
I will keep this up only to find someone else that wants to continue maintaining/enhancing it. Please write me if you are interested

#![Butter.js logo](https://raw.githubusercontent.com/bagel-framework/Butter.js/master/logos/logo.png)

MVW - Functional Reactive Progamming Javascript Framework build with [Bacon.js](https://github.com/baconjs/bacon.js)

__Work in progress... stay tuned!__

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]

[![Dependency Status][gemnasium-image]][gemnasium-url]
[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]

[![MIT License][license-image]][license-url]

[![Sauce Test Status][saucelabs-image]][saucelabs-url]


# Documentation

## Butter.View

The Butter.View class keeps your DOM elements always in sync with your application data.

### Example

#### HTML
```html
<!-- this html will be always in sync with your view data -->
<ul id="toast">
  <li data-each="ingredients as ingredient">
    <span data-text="ingredient"></span>
  </li>
</ul>
```
#### javascript
```javascript
new Butter.View({
	el: '#toast',
	data: {
      ingredients: [
        "butter",
        "marmalade"
      ]
    }
}).render();
```
#### [Result](http://bagel-framework.github.io/Butter.js/examples/views/simple.html)

### Other Live Examples

- [css binding](http://bagel-framework.github.io/Butter.js/examples/views/ball.html)
- [dynamic list](http://bagel-framework.github.io/Butter.js/examples/views/list.html)
- [subviews injection](http://bagel-framework.github.io/Butter.js/examples/views/subviews.html)

### Methods

## Butter.Data

### Methods


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

[travis-url]:https://travis-ci.org/bagel-framework/Butter.js
[travis-image]: https://img.shields.io/travis/bagel-framework/Butter.js.svg?style=flat-square

[saucelabs-image]:https://saucelabs.com/browser-matrix/butter.svg
[saucelabs-url]:https://saucelabs.com/u/butter

[license-url]: LICENSE
[license-image]: http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square



