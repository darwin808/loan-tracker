import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Schema init — runs once, subsequent calls are no-ops due to IF NOT EXISTS
async function runMigrations() {
  await db.batch(
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
      `CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        username      TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at    TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        id         TEXT PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    ],
    "write"
  );

  // Add user_id column to loans if it doesn't exist yet
  try {
    await db.execute("ALTER TABLE loans ADD COLUMN user_id INTEGER REFERENCES users(id)");
  } catch {
    // Column already exists — ignore
  }
}

export const initDb = runMigrations();

export { db };
