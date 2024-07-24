import { test, expect } from 'vitest';

import { search } from '../search';

import { getDBBoolean } from './utils/getDBBoolean';

test('boolean', () => {
  const db = getDBBoolean();
  expect(search('is1D:true', db)).toHaveLength(2);
  expect(search('is2D:true', db)).toHaveLength(2);
  expect(search('is1D:false', db)).toHaveLength(2);
  expect(search('is2D:false', db)).toHaveLength(2);
  expect(search('is1D:true is2D:true', db)).toHaveLength(1);
  expect(search('is1D:true is2D:false', db)).toHaveLength(1);
  expect(search('is1D:false is2D:false', db)).toHaveLength(1);
});
