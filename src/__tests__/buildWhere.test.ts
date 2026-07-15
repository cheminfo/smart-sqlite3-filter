import { expect, test } from 'vitest';

import { buildWhere } from '../buildWhere.ts';

import { getDBNames } from './utils/getDBNames.ts';

/*
  ('John', 1990, 30.1, male),
  ('Jane', 1985, 29.7, male),
  ('Alice', 2000, 25, female),
  ('Bob', 1990, 43, female);
*/

test('an empty query yields an empty condition', () => {
  const db = getDBNames();
  const { where, values } = buildWhere('', db);

  expect(where).toBe('');
  expect(values).toStrictEqual({});
});

test('a text criterium becomes a LIKE with a named parameter', () => {
  const db = getDBNames();
  const { where, values } = buildWhere('name:~o', db);

  expect(where).toBe('((name LIKE :name_0_0))');
  // The generated parameter names are not camelCase, so they are asserted
  // through the emitted condition rather than spelled as identifiers here.
  expect(Object.keys(values)).toStrictEqual(['name_0_0']);
  expect(Object.values(values)).toStrictEqual(['%o%']);
});

test('criteria are AND-ed together', () => {
  const db = getDBNames();
  const { where } = buildWhere('name:^J year:>1985', db);

  expect(where).toBe('((name LIKE :name_0_0)) AND ((year > :year_1_0))');
});

test('the built condition selects the same rows as search()', () => {
  const db = getDBNames();
  const { where, values } = buildWhere('year:1990,2000 name:$e,n', db);
  const rows = db
    .prepare(`SELECT name FROM names WHERE ${where} ORDER BY name`)
    .all(values) as Array<{ name: string }>;

  expect(rows.map((row) => row.name)).toStrictEqual(['Alice', 'John']);
});

test('the caller can add its own named parameters without collision', () => {
  const db = getDBNames();
  const { where, values } = buildWhere('year:>=1990', db);
  const rows = db
    .prepare(
      `SELECT name FROM names WHERE ${where} AND age < :maxAge ORDER BY name`,
    )
    .all({ ...values, maxAge: 40 }) as Array<{ name: string }>;

  expect(rows.map((row) => row.name)).toStrictEqual(['Alice', 'John']);
});

test('the condition composes into COUNT(*) and into a paginated query', () => {
  const db = getDBNames();
  const { where, values } = buildWhere('year:>=1985', db);

  const { total } = db
    .prepare(`SELECT COUNT(*) AS total FROM names WHERE ${where}`)
    .get(values) as { total: number };

  expect(total).toBe(4);

  const page = db
    .prepare(
      `SELECT name FROM names WHERE ${where} ORDER BY name LIMIT :limit OFFSET :offset`,
    )
    .all({ ...values, limit: 2, offset: 1 }) as Array<{ name: string }>;

  expect(page.map((row) => row.name)).toStrictEqual(['Bob', 'Jane']);
});

test('the condition composes into a subquery driving a join', () => {
  const db = getDBNames();
  db.exec(`CREATE TABLE pets (owner_id INTEGER NOT NULL, pet TEXT NOT NULL);
           INSERT INTO pets (owner_id, pet) VALUES (1, 'cat'), (3, 'dog'), (4, 'rat')`);
  const { where, values } = buildWhere('year:>=1990', db, {
    tableName: 'names',
  });
  const rows = db
    .prepare(
      `SELECT p.pet FROM (SELECT id FROM names WHERE ${where}) c
       JOIN pets p ON p.owner_id = c.id ORDER BY p.pet`,
    )
    .all(values) as Array<{ pet: string }>;

  expect(rows.map((row) => row.pet)).toStrictEqual(['cat', 'dog', 'rat']);
});

test('an unknown field throws rather than matching everything', () => {
  const db = getDBNames();

  expect(() => buildWhere('unknownColumn:42', db)).toThrow(
    'Field unknownColumn does not exist in the schema',
  );
});
