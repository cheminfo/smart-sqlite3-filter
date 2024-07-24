import { test, expect } from 'vitest';

import { search } from '../search';

import { getDBBsons } from './utils/getDBBsons';

test.skip('names', () => {
  const db = getDBBsons();
  /*
    ('John', 1990),
    ('Jane', 1985),
    ('Alice', 2000),
    ('Bob', 1990);
  */
  expect(search('year:1990,2000 name:$e,n', db)).toHaveLength(2);

  expect(search('bson.year:1990,2000 bson.name:$e,n', db)).toHaveLength(2);
});
