import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to';
import { expect, test } from 'vitest';

import { getNumberRange } from '../getNumberRange';

expect.extend({ toBeDeepCloseTo, toMatchCloseTo });

test('getNumberRange', () => {
  // const result = getNumberRange('-10e-2');
  // console.log(result);
  expect(getNumberRange('1')).toEqual({ min: 0.5, max: 1.5 });
  expect(getNumberRange('5')).toEqual({ min: 4.5, max: 5.5 });
  expect(getNumberRange('10')).toEqual({ min: 9.5, max: 10.5 });
  expect(getNumberRange('10.0')).toBeDeepCloseTo({ min: 9.95, max: 10.05 });
  expect(getNumberRange('10.01')).toBeDeepCloseTo({ min: 10.005, max: 10.015 });
  expect(getNumberRange('0.1')).toBeDeepCloseTo({ min: 0.05, max: 0.15 });
  expect(getNumberRange('0.15')).toBeDeepCloseTo({ min: 0.145, max: 0.155 });
  expect(getNumberRange('-1')).toBeDeepCloseTo({ min: -1.5, max: -0.5 });
  expect(getNumberRange('-1.1')).toBeDeepCloseTo({ min: -1.15, max: -1.05 });

  expect(getNumberRange('1e-1')).toBeDeepCloseTo({ min: 0.05, max: 0.15 });
  expect(getNumberRange('1e1')).toBeDeepCloseTo({ min: 5, max: 15 });
  expect(getNumberRange('10e-1')).toBeDeepCloseTo({ min: 0.95, max: 1.05 });
  expect(getNumberRange('-10e-1')).toBeDeepCloseTo({ min: -1.05, max: -0.95 });
  expect(getNumberRange('-10e-2')).toBeDeepCloseTo({
    min: -0.105,
    max: -0.095,
  });
});
