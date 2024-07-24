import sqLite, { Database } from 'better-sqlite3';

export function getDBBsons(): Database {
  const db = sqLite(':memory:');

  // create data and add some dummy data
  const sql = `
    CREATE TABLE IF NOT EXISTS bsons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      year INTEGER NOT NULL,
      bson BLOB NOT NULL
    );

    INSERT INTO bsons (name, year, bson) VALUES
    ('John', 1990, jsonb('{"name": "John", "year": 1990}')),
    ('Jane', 1985, jsonb('{"name": "Jane", "year": 1985}')),
    ('Alice', 2000, jsonb('{"name": "Alice", "year": 2000}')),
    ('Bob', 1990, jsonb('{"name": "Bob", "year": 1990}'));
  `;

  db.exec(sql);

  return db;
}
