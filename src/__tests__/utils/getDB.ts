import { DatabaseSync } from 'node:sqlite';

export function getDB(): DatabaseSync {
  const db = new DatabaseSync(':memory:');

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

function fillDatabase(db: DatabaseSync): void {
  const stmt = db.prepare(
    'INSERT INTO entries (textColumn, numberColumn, booleanColumn) VALUES (?, ?, ?)',
  );

  for (let i = 0; i < 100; i++) {
    stmt.run(`text-${i}`, i, (i * 2) % 2);
    stmt.run(`Text-${i}`, i, (i * 2 + 1) % 2);
  }
}
