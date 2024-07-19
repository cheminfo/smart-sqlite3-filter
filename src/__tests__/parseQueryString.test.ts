import { test, expect } from 'vitest';

import { parseQueryString } from '../parseQueryString';

test('parseQueryString', () => {
  const result = parseQueryString('name:abc');
  expect(result).toStrictEqual([
    {
      fields: ['name'],
      operator: '',
      values: ['abc'],
      negate: false,
    },
  ]);
});
