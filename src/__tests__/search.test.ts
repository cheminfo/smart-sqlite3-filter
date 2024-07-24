import { test, expect } from 'vitest';

import { search } from '../search';

import { getDB } from './utils/getDB';

test('text', () => {
  const db = getDB();
  expect(search('text-12', db)).toHaveLength(2);
  expect(search('textColumn:text-1', db)).toHaveLength(22);
  expect(search('textColumn:=text-1', db)).toHaveLength(1);
  expect(search('textColumn:text-1', db, { limit: 5 })).toHaveLength(5);
  expect(search('textColumn:"text-1"', db, { limit: 5 })).toHaveLength(5);
  expect(search(`textColumn:'text-1'`, db, { limit: 5 })).toHaveLength(5);
  expect(search(`textColumn:text-1 booleanColumn:1`, db)).toHaveLength(11);
  expect(search(`textColumn:ext`, db)).toHaveLength(0);
  expect(search(`textColumn:~ext`, db)).toHaveLength(200);
  expect(search(`textColumn:`, db)).toHaveLength(200);
  expect(search(`textColumn:^ext`, db)).toHaveLength(0);
  expect(search(`textColumn:$90`, db)).toHaveLength(2);
});

test('text multiple values', () => {
  const db = getDB();
  expect(search('textColumn:text-1,text-2', db)).toHaveLength(44);
  expect(search('textColumn:=text-1,text-2', db)).toHaveLength(2);
  expect(search('textColumn:$text-1,text-2', db)).toHaveLength(4);
  expect(search('numberColumn:1,2,3', db)).toHaveLength(6);
});

test('number', () => {
  const db = getDB();
  expect(search('numberColumn:1', db)).toHaveLength(2);
  expect(search('numberColumn:1,2,3', db)).toHaveLength(6);
  expect(search('numberColumn:=1', db)).toHaveLength(2);
  expect(search('numberColumn:<5', db)).toHaveLength(10);
  expect(search('numberColumn:<=5', db)).toHaveLength(12);
  expect(search('numberColumn:5..6', db)).toHaveLength(4);
});

test('orderBy', () => {
  const db = getDB();
  const result = search('numberColumn:1,2,3', db, {
    orderBy: 'numberColumn DESC',
  }).map((entry) => entry.numberColumn);
  expect(result).toEqual([3, 3, 2, 2, 1, 1]);
});

test('errors', () => {
  const db = getDB();
  expect(() => search('numberColumn:>1,2', db)).toThrow(
    'Number does not support multiple values',
  );
  expect(() => search('stringColumn:>""', db)).toThrow(
    'Field stringColumn does not exist in the schema',
  );

  expect(() => search('textColumn:>""', db)).toThrow(
    'Operator > is not supported for String',
  );
});
