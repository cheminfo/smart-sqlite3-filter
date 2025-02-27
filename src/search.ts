import type { Database } from 'better-sqlite3';
import type { Logger } from 'cheminfo-types';

import { getSchema } from './getSchema';
import { appendSQLForCriteria } from './utils/appendSQLForCriteria';
import { parseQueryString } from './utils/parseQueryString';

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
  db: Database,
  options: SearchOptions = {},
): Entry[] {
  const {
    tableName = getTableName(db),
    limit = 1000,
    orderBy = '',
    logger,
  } = options;
  const schema = getSchema(db, tableName);
  let criteria = parseQueryString(queryString, schema, options);
  const values = appendSQLForCriteria(criteria, schema, options);
  // some criteria may should be removed because they don't have sql property
  criteria = criteria.filter((criterium) => criterium.sql);

  const sqls: string[] = [];
  sqls.push(`SELECT * FROM ${tableName}`);
  if (criteria.length > 0) {
    sqls.push(
      `WHERE ${criteria.map((criterium) => criterium.sql).join(' AND ')}`,
    );
  }
  if (orderBy) {
    sqls.push(`ORDER BY ${orderBy}`);
  }
  if (limit) {
    sqls.push(`LIMIT ${limit}`);
  }
  //console.log(values);

  logger?.debug(values, `SQL statement: ${sqls.join(' ')}`);
  const stmt = db.prepare(sqls.join(' '));
  return stmt.all(values) as Entry[];
}

interface TableList {
  schema: string;
  name: string;
  type: string;
  ncol: number;
  wr: number;
  strict: number;
}

function getTableName(db: Database): string {
  const stmt = db.prepare('PRAGMA table_list');
  const allTables = stmt.all() as TableList[];
  const tables = allTables.filter((table) => !table.name.startsWith('sqlite_'));
  if (tables.length === 0) {
    throw new Error('Expected at least one table in the database');
  }
  if (tables.length > 1) {
    throw new Error(
      'There is more than one table in the database, you need to specify the table name',
    );
  }
  return tables[0].name;
}
