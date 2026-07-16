import type { DatabaseSync } from 'node:sqlite';

import type { Logger } from 'cheminfo-types';

import { getSchema } from './getSchema.ts';
import { appendSQLForCriteria } from './utils/appendSQLForCriteria.ts';
import { parseQueryString } from './utils/parseQueryString.ts';

export interface BuildWhereOptions {
  /**
   * The name of the table the query targets. Required to read the schema, which
   * decides how each field is compared (text / number / boolean / blob).
   * If not provided and there is only one table in the database it will be used.
   */
  tableName?: string;
  /**
   * In which fields to search. If not provided all fields will be searched.
   */
  defaultFields?: string[];
  /**
   * Aliases for the fields. If not provided the fields will be used as aliases
   * It is possible to specify many fields in which the search will be performed
   */
  fieldsAliases?: Record<string, string[]>;
  /**
   * We can log more information about how queries are executed
   */
  logger?: Logger;
}

export interface BuiltWhere {
  /**
   * The WHERE condition, without the `WHERE` keyword, ready to be interpolated
   * into a larger statement. Empty when the query string carries no usable
   * criteria — callers should then omit their `WHERE` clause (or use `'1 = 1'`).
   */
  where: string;
  /**
   * Named parameters to bind. Always pass the whole object to the statement:
   * `stmt.all({ ...values, ...yourOwnParams })`.
   */
  values: Record<string, number | string>;
}

/**
 * Translate a query string into a WHERE condition plus its bound parameters,
 * without running it. This is the composable half of {@link search}: the caller
 * owns the statement and can add its own joins, `ORDER BY`, `LIMIT`/`OFFSET`,
 * or wrap it in a `COUNT(*)` — none of which `search` can express.
 *
 * The emitted parameters are named (`:column_i_j`), so they can be merged with
 * the caller's own named parameters without colliding on position.
 * @param queryString - the query string, same syntax as {@link search}
 * @param db - the database whose schema decides how each field is compared
 * @param options - options to customize the parsing
 * @returns The WHERE condition and the values to bind
 * @example
 * ```js
 * const { where, values } = buildWhere('name:~ester mw:100..500', db, {
 *   tableName: 'molecules',
 * });
 * const sql = `SELECT id FROM molecules WHERE ${where || '1 = 1'} ORDER BY mw LIMIT :limit OFFSET :offset`;
 * const rows = db.prepare(sql).all({ ...values, limit: 50, offset: 0 });
 * const { total } = db
 *   .prepare(`SELECT COUNT(*) AS total FROM molecules WHERE ${where || '1 = 1'}`)
 *   .get(values);
 * ```
 */
export function buildWhere(
  queryString: string,
  db: DatabaseSync,
  options: BuildWhereOptions = {},
): BuiltWhere {
  const { tableName = getTableName(db), logger } = options;
  const schema = getSchema(db, tableName);
  const criteria = parseQueryString(queryString, schema, options);
  const values = appendSQLForCriteria(criteria, schema, options);
  // Criteria that produced no SQL (e.g. a field absent from the schema) are
  // dropped rather than silently matching everything.
  const where = criteria
    .filter((criterium) => criterium.sql)
    .map((criterium) => criterium.sql)
    .join(' AND ');

  logger?.debug(values, `WHERE condition: ${where}`);
  return { where, values };
}

interface TableList {
  schema: string;
  name: string;
  type: string;
  ncol: number;
  wr: number;
  strict: number;
}

/**
 * Resolve the table to query when the caller did not name one.
 * @param db - the database to inspect
 * @returns The only user table in the database
 */
export function getTableName(db: DatabaseSync): string {
  const stmt = db.prepare('PRAGMA table_list');
  const allTables = stmt.all() as unknown as TableList[];
  const tables = allTables.filter((table) => !table.name.startsWith('sqlite_'));
  const [table] = tables;
  if (!table) {
    throw new Error('Expected at least one table in the database');
  }
  if (tables.length > 1) {
    throw new Error(
      'There is more than one table in the database, you need to specify the table name',
    );
  }
  return table.name;
}
