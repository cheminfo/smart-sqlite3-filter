import { expect, test } from 'vitest';

import { getDB } from '../../__tests__/utils/getDB.ts';
import { getSchema } from '../../getSchema.ts';
import { parseQueryString } from '../parseQueryString.ts';

test('parseQueryString', () => {
  const db = getDB();
  const schema = getSchema(db, 'entries');
  const result = parseQueryString('textColumn:abc', schema);

  expect(result).toStrictEqual([
    {
      parameters: [
        {
          column: 'textColumn',
          type: 'TEXT',
          jpath: 'textColumn',
          accessor: 'textColumn',
          isJpath: false,
        },
      ],
      operator: '',
      values: ['abc'],
      valuesType: 'string',
      negate: false,
      index: 0,
    },
  ]);
});
