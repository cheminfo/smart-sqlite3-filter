import sqLite, { Database } from 'better-sqlite3';

export function getDBNames(): Database {
  const db = sqLite(':memory:');

  // create data and add some dummy data
  const sql = `
    CREATE TABLE IF NOT EXISTS names (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      year INTEGER NOT NULL
    );

    INSERT INTO names (name, year) VALUES
    ('John', 1990),
    ('Jane', 1985),
    ('Alice', 2000),
    ('Bob', 1990);
  `;

  db.exec(sql);

  return db;
}
