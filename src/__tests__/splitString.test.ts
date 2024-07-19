import { expect, test } from 'vitest';

import { splitString } from '../splitString';

test('splitString', () => {
  expect(splitString('abc')).toEqual(['abc']);
  expect(splitString('abc')).toEqual(['abc']);
  expect(splitString('abc.def')).toEqual(['abc.def']);
  expect(splitString('abc def')).toEqual(['abc', 'def']);
  expect(splitString('abc    def')).toEqual(['abc', 'def']);
  expect(splitString('"abc d"    def')).toEqual(['abc d', 'def']);
});
