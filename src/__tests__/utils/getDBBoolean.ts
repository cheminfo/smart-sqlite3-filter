import sqLite, { Database } from 'better-sqlite3';

export function getDBBoolean(): Database {
  const db = sqLite(':memory:');

  const sql = `
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      is1D BOOLEAN NOT NULL,
      is2D BOOLEAN NOT NULL
    );

    INSERT INTO entries (is1D, is2D) VALUES
      (0,0),
      (1,0),
      (0,1),
      (1,1);
`;
  db.exec(sql);
  return db;
}
