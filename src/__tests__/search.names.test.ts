import { test, expect } from 'vitest';

import { search } from '../search';

import { getDBNames } from './utils/getDBNames';

test('names', () => {
  const db = getDBNames();
  /*
    ('John', 1990),
    ('Jane', 1985),
    ('Alice', 2000),
    ('Bob', 1990);
  */
  expect(search('John', db)).toHaveLength(1);
  expect(search('1990', db)).toHaveLength(2);
  expect(search('J', db)).toHaveLength(2);
  expect(search('year:>1990', db)).toHaveLength(1);
  expect(search('name:~o', db)).toHaveLength(2);
  expect(search('name:$e', db)).toHaveLength(2);
  expect(search('year:1990,2000', db)).toHaveLength(3);
  expect(search('year:1980..1987', db)).toHaveLength(1);
  expect(search('year:!=1990,2000', db)).toHaveLength(1);
  expect(search('year:<>1990,2000', db)).toHaveLength(1);
  expect(search('year:1990,2000 name:$e,n', db)).toHaveLength(2);
  expect(search('year:"1990,2000"', db)).toHaveLength(4);
  expect(search('year:"1990","2000"', db)).toHaveLength(3);
});
