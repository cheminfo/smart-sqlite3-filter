import { Database } from 'better-sqlite3';

import { buildQueryCriteria } from './buildQueryCriteria';
import { parseQueryString } from './parseQueryString';

interface SearchOptions {
  /**
   * The name of the table to search. If not provided and there is only a table in the database it will be sued.
   */
  tableName?: string;
  /**
   * The maximum number of results to return
   * @default 1000
   */
  limit?: number;
  defaultFields: string[];
  fieldsAliases: Record<string, string[]>;
}

/**
 *
 * @param queryString
 * @param db
 * @param options
 */
export function search(
  queryString: string,
  db: Database,
  options: SearchOptions = {},
): any[] {
  const { tableName = getTableName(db), limit = 1000 } = options;
  const schema = getSchema(db, tableName);
  const criteria = parseQueryString(queryString);
  const values = buildQueryCriteria(criteria, schema, options);

  const sqls: string[] = [];
  sqls.push(`SELECT * FROM ${tableName}`);
  if (criteria.length > 0) {
    sqls.push(
      `WHERE ${criteria.map((criterium) => criterium.sql).join(' AND ')}`,
    );
  }
  if (limit) {
    sqls.push(`LIMIT ${limit}`);
  }
  const stmt = db.prepare(sqls.join(' '));
  return stmt.all(values);
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
  const tables = stmt
    .all()
    .filter((table) => !table.name.startsWith('sqlite_')) as TableList[];
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

interface TableInfo {
  cid: number;
  name: 'INTEGER' | 'TEXT' | 'REAL' | 'BLOB' | 'BOOLEAN';
  type: string;
  notnull: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  dflt_value: any;
  pk: number;
}

function getSchema(db: Database, tableName: string): Record<string, any> {
  const stmt = db.prepare(`PRAGMA table_info(${tableName})`);
  const tableInfo = stmt.all() as TableInfo[];

  const schema: Record<string, TableInfo> = {};
  for (const column of tableInfo) {
    schema[column.name] = column;
  }
  return schema;
}
