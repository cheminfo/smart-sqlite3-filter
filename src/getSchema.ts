import type { DatabaseSync } from 'node:sqlite';

import type { Schema } from './types/Schema.ts';
import type { TableInfo } from './types/TableInfo.ts';

export function getSchema(db: DatabaseSync, tableName: string): Schema {
  const stmt = db.prepare(`PRAGMA table_info(${tableName})`);
  const tableInfo = stmt.all() as unknown as TableInfo[];

  const schema: Schema = {};
  for (const column of tableInfo) {
    schema[column.name] = column;
  }
  return schema;
}
