# smart-sqlite3-filter

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

This package allows to query a sqlite3 database using better-sqlite3 in a way like 'firstname:luc'.

## Installation

`$ npm i smart-sqlite3-filter`

## Usage

```js
import { search } from 'smart-sqlite3-filter';

const results = search('firstname:luc', db, { limit: 2 });
```

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/smart-sqlite3-filter.svg
[npm-url]: https://www.npmjs.com/package/smart-sqlite3-filter
[ci-image]: https://github.com/cheminfo/smart-sqlite3-filter/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/cheminfo/smart-sqlite3-filter/actions?query=workflow%3A%22Node.js+CI%22
[codecov-image]: https://img.shields.io/codecov/c/github/cheminfo/smart-sqlite3-filter.svg
[codecov-url]: https://codecov.io/gh/cheminfo/smart-sqlite3-filter
[download-image]: https://img.shields.io/npm/dm/smart-sqlite3-filter.svg
[download-url]: https://www.npmjs.com/package/smart-sqlite3-filter
