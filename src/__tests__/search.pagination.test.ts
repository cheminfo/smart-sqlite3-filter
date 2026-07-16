import { expect, test } from 'vitest';

import { count, search } from '../search.ts';

import { getDBNames } from './utils/getDBNames.ts';

/*
  ('John', 1990, 30.1, male),
  ('Jane', 1985, 29.7, male),
  ('Alice', 2000, 25, female),
  ('Bob', 1990, 43, female);
*/

test('from skips results, paging through an ordered result set', () => {
  const db = getDBNames();
  const options = { orderBy: 'name', limit: 2 };

  expect(search('', db, options).map((entry) => entry.name)).toStrictEqual([
    'Alice',
    'Bob',
  ]);
  expect(
    search('', db, { ...options, from: 2 }).map((entry) => entry.name),
  ).toStrictEqual(['Jane', 'John']);
  expect(search('', db, { ...options, from: 4 })).toStrictEqual([]);
});

test('from applies on top of a filter', () => {
  const db = getDBNames();
  const entries = search('year:1990', db, {
    orderBy: 'name',
    limit: 10,
    from: 1,
  });

  expect(entries.map((entry) => entry.name)).toStrictEqual(['John']);
});

test('columns restricts the selected columns', () => {
  const db = getDBNames();
  const entries = search('name:John', db, { columns: ['name', 'year'] });

  expect(entries).toStrictEqual([{ name: 'John', year: 1990 }]);
});

test('count returns the total, ignoring limit and from', () => {
  const db = getDBNames();

  expect(count('', db)).toBe(4);
  expect(count('year:1990', db)).toBe(2);
  expect(count('year:1990', db, { limit: 1, from: 1 })).toBe(2);
  expect(count('name:~zzz', db)).toBe(0);
});

test('count and search agree on the same query', () => {
  const db = getDBNames();
  const query = 'year:>=1990 name:$e,n';

  expect(count(query, db)).toBe(search(query, db, { limit: 100 }).length);
});
