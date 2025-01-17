import type { Database } from 'better-sqlite3';

import type { Schema } from './types/Schema';
import type { TableInfo } from './types/TableInfo';

export function getSchema(db: Database, tableName: string): Schema {
  const stmt = db.prepare(`PRAGMA table_info(${tableName})`);
  const tableInfo = stmt.all() as TableInfo[];

  const schema: Schema = {};
  for (const column of tableInfo) {
    schema[column.name] = column;
  }
  return schema;
}
