import { test, expect } from 'vitest';

import { search } from '../search';

import { getDBBsons } from './utils/getDBBsons';

test('names', () => {
  const db = getDBBsons();
  /*
    ('John', 1990),
    ('Jane', 1985),
    ('Alice', 2000),
    ('Bob', 1990);
  */
  expect(search('name:$e,n', db)).toHaveLength(3);
  expect(search('year:1990,2000 name:$e,n', db)).toHaveLength(2);
  expect(search('bson.year:1990', db)).toHaveLength(2);
  expect(search('bson.name:$e', db)).toHaveLength(2);
  expect(search('bson.name:$e,n', db)).toHaveLength(3);
  expect(search('bson.year:1990,2000 bson.name:$e,n', db)).toHaveLength(2);

  expect(search('bson.ab:n', db)).toHaveLength(0);
  expect(() => search(`bson.ab$cd:""`, db)).toThrow(
    'Invalid column name: bson.ab$cd',
  );
});
