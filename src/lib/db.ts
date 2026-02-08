import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Schema init — runs once, subsequent calls are no-ops due to IF NOT EXISTS
export const initDb = db.batch(
  [
    `CREATE TABLE IF NOT EXISTS loans (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      name           TEXT NOT NULL,
      amount         REAL NOT NULL,
      payment_amount REAL NOT NULL,
      frequency      TEXT NOT NULL,
      start_date     TEXT NOT NULL,
      created_at     TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      loan_id    INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
      date       TEXT NOT NULL,
      amount     REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(loan_id, date)
    )`,
  ],
  "write"
);

export { db };
