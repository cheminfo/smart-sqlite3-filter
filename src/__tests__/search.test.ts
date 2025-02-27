/* eslint-disable camelcase */
import { FifoLogger } from 'fifo-logger';
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
  expect(() => search('textColumn.ab:""', db)).toThrow(
    "Field textColumn is not a BLOB, you can't use jpath",
  );
});

test('logger', () => {
  const db = getDB();
  const logger1 = new FifoLogger();
  search('textColumn:text-1', db, { logger: logger1 });
  expect(logger1.getLogs()).toHaveLength(0);
  const logger2 = new FifoLogger({ level: 'debug' });
  search('textColumn:text-1', db, { logger: logger2 });
  const logs = logger2.getLogs();
  expect(logs).toHaveLength(1);
  expect(logs[0].message).toBe(
    'SQL statement: SELECT * FROM entries WHERE ((textColumn LIKE :textColumn_0_0)) LIMIT 1000',
  );
  expect(logs[0].meta).toStrictEqual({ textColumn_0_0: 'text-1%' });
});
