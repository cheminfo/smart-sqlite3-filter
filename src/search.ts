import type { DatabaseSync } from 'node:sqlite';

import type { Logger } from 'cheminfo-types';

import { buildWhere, getTableName } from './buildWhere.ts';

export interface SearchOptions {
  /**
   * Specify the order of the results
   * @default ''
   */
  orderBy?: string;
  /**
   * The name of the table to search. If not provided and there is only a table in the database it will be sued.
   */
  tableName?: string;
  /**
   * The maximum number of results to return
   * @default 1000
   */
  limit?: number;
  /**
   * Number of results to skip, for pagination. Requires a `limit`: SQLite has
   * no OFFSET without LIMIT.
   * @default 0
   */
  from?: number;
  /**
   * Columns to return. Defaults to every column (`*`). Naming only the columns
   * you need avoids reading wide ones (blobs, coordinates) you are going to
   * throw away.
   * @default ['*']
   */
  columns?: string[];
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

export type Entry = Record<string, number | string>;

/**
 * Search the database for the given query string
 * @param queryString - the query string
 * @param db - the database to search
 * @param options - options to customize the search
 * @returns The results of the search
 */
export function search(
  queryString: string,
  db: DatabaseSync,
  options: SearchOptions = {},
): Entry[] {
  const {
    tableName = getTableName(db),
    limit = 1000,
    from = 0,
    orderBy = '',
    columns = ['*'],
    logger,
  } = options;
  // `logger` is deliberately not forwarded: search logs the full statement
  // below, and buildWhere would log the bare WHERE first.
  const { where, values } = buildWhere(queryString, db, {
    ...options,
    tableName,
    logger: undefined,
  });

  const sqls: string[] = [`SELECT ${columns.join(', ')} FROM ${tableName}`];
  if (where) {
    sqls.push(`WHERE ${where}`);
  }
  if (orderBy) {
    sqls.push(`ORDER BY ${orderBy}`);
  }
  if (limit) {
    sqls.push(`LIMIT ${limit}`);
    // OFFSET is only legal after a LIMIT.
    if (from) {
      sqls.push(`OFFSET ${from}`);
    }
  }

  logger?.debug(values, `SQL statement: ${sqls.join(' ')}`);
  const stmt = db.prepare(sqls.join(' '));
  const rows = stmt.all(values);
  // node:sqlite hands back null-prototype rows whose properties stay in V8
  // dictionary mode: reading one costs ~43ns instead of ~4ns. Copying into
  // plain objects costs ~0.5ms/1000 rows and pays for itself after ~4 passes.
  const entries: Entry[] = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) {
    entries[i] = { ...(rows[i] as Entry) };
  }
  return entries;
}

/**
 * Count the entries matching the given query string, ignoring `limit` / `from`.
 * Pairs with {@link search} when a UI needs the total number of matches
 * alongside one page of them.
 * @param queryString - the query string
 * @param db - the database to search
 * @param options - options to customize the search
 * @returns The number of matching entries
 */
export function count(
  queryString: string,
  db: DatabaseSync,
  options: SearchOptions = {},
): number {
  const { tableName = getTableName(db), logger } = options;
  const { where, values } = buildWhere(queryString, db, {
    ...options,
    tableName,
    logger: undefined,
  });
  const sql = `SELECT COUNT(*) AS count FROM ${tableName}${where ? ` WHERE ${where}` : ''}`;

  logger?.debug(values, `SQL statement: ${sql}`);
  const row = db.prepare(sql).get(values) as { count: number };
  return row.count;
}
