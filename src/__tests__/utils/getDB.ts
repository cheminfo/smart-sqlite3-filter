import sqLite, { Database } from 'better-sqlite3';

export function getDB(): Database {
  const db = sqLite(':memory:');

  const sql = `
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      textColumn TEXT NOT NULL,
      numberColumn INTEGER NOT NULL,
      booleanColumn BOOLEAN NOT NULL
    );

`;
  db.exec(sql);
  fillDatabase(db);
  return db;
}

function fillDatabase(db: Database): void {
  const stmt = db.prepare(
    'INSERT INTO entries (textColumn, numberColumn, booleanColumn) VALUES (?, ?, ?)',
  );

  for (let i = 0; i < 100; i++) {
    stmt.run(`text-${i}`, i, (i * 2) % 2);
    stmt.run(`Text-${i}`, i, (i * 2 + 1) % 2);
  }
}
