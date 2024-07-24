import sqLite, { Database } from 'better-sqlite3';

export function getDBNames(): Database {
  const db = sqLite(':memory:');

  // create data and add some dummy data
  const sql = `
    CREATE TABLE IF NOT EXISTS names (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      year INTEGER NOT NULL,
      age REAL NOT NULL,
      male BOOLEAN NOT NULL
    );

    INSERT INTO names (name, year, age, male) VALUES
    ('John', 1990, 30.1, 1),
    ('Jane', 1985, 29.7, 1),
    ('Alice', 2000, 25, 0),
    ('Bob', 1990, 43, 0);
  `;

  db.exec(sql);

  return db;
}
