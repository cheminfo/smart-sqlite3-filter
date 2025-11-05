import { expect, test } from 'vitest';

import { splitString } from '../splitString';

test('splitString', () => {
  expect(splitString('abc')).toStrictEqual(['abc']);
  expect(splitString('abc')).toStrictEqual(['abc']);
  expect(splitString('abc.def')).toStrictEqual(['abc.def']);
  expect(splitString('abc def')).toStrictEqual(['abc', 'def']);
  expect(splitString('abc    def')).toStrictEqual(['abc', 'def']);
  expect(splitString('"abc d"    def')).toStrictEqual(['abc d', 'def']);
});
