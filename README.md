# smart-sqlite3-filter

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

This package allows to query a sqlite3 database using better-sqlite3 in a way like 'firstName:luc'.

## Development on Apple Silicon

```bash
cd node_modules/better-sqlite3
npm run build-release
```

## Installation

`$ npm i smart-sqlite3-filter`

## Usage

```js
import { search } from 'smart-sqlite3-filter';
import sqLite from 'better-sqlite3';

const db = sqLite(':memory:');
const sql = `
  CREATE TABLE IF NOT EXISTS names (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    year INTEGER NOT NULL
  );
  INSERT INTO names (name, year) VALUES
  ('John', 1990),
  ('Jane', 1985),
  ('Alice', 2000),
  ('Bob', 1990);
`;
db.exec(sql);

// We don't search in a specific column, it will search everywhere
// For string column it is case insensitive and should startWith, for number it should be the exact value
search('John', db); // [{name: 'John', year: 1990}]

search('1990', db); // [{name: 'John', year: 1990}]

search('J', db); // [{name: 'John', year: 1990}, {name: 'Jane', year: 1985}]

// we search in a specific field and use the operator '>'. For numbers the following operators can be used: '>', '>=', '<', '<=', '<>', '!=', '='. Default to 'starts with'
search('year:>1990', db); // [{name: 'Alice', year: 2000}]
search('year:!=1990,2000', db); // [{name: 'Jane', year: 1985}]
search('year:<>1990,2000', db); // [{name: 'Jane', year: 1985}]

// when searching for a string we can use the following operators: '^' (starts with), '$' (ends with), '~' (contains), '='. Default to contains. When searching for '=' it is case sensitive otherwise it is not.
search('name:~o', db); // [{name: 'John', year: 1990}, {name: 'Bob', year: 1990}]
search('name:$e', db); // [{name: 'Alice', year: 2000}]
search('name:^J', db); // [{name: 'John', year: 1990}, {name: 'Jane', year: 1985}]

// A field may have various values separated by ','
search('year:1990,2000', db); // [{name: 'John', year: 1990}, {name: 'Bob', year: 1990}, {name: 'Alice', year: 2000}]
search('year:1990,2000 name:$e,n', db); // [{name: 'John', year: 1990}, {name: 'Alice', year: 2000}]
search('year:!=1990,2000', db); // [{name: 'Jane', year: 1985}]

// It is possible by searching for a range of values using '..'
search('year:1980..1987', db); // [{name: 'Jane', year: 1985}]
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
