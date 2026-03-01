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
      `CREATE TABLE IF NOT EXISTS bills (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        amount     REAL NOT NULL,
        frequency  TEXT NOT NULL,
        start_date TEXT NOT NULL,
        user_id    INTEGER REFERENCES users(id),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS bill_payments (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_id    INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
        date       TEXT NOT NULL,
        amount     REAL NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(bill_id, date)
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

  // Add type column to bills (expense vs income)
  try {
    await db.execute("ALTER TABLE bills ADD COLUMN type TEXT NOT NULL DEFAULT 'expense'");
  } catch {
    // Column already exists — ignore
  }

  // Savings table
  await db.execute(
    `CREATE TABLE IF NOT EXISTS savings (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name       TEXT NOT NULL,
      balance    REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  );

  // Add email column to users
  try {
    await db.execute("ALTER TABLE users ADD COLUMN email TEXT");
  } catch {
    // Column already exists — ignore
  }
  // Unique index on email (ALTER TABLE can't add UNIQUE constraint in SQLite)
  await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)");

  // Add role column to users
  try {
    await db.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
  } catch {
    // Column already exists — ignore
  }

  // OAuth accounts table
  await db.execute(
    `CREATE TABLE IF NOT EXISTS oauth_accounts (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider            TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      email               TEXT,
      created_at          TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(provider, provider_account_id)
    )`
  );
}

export const initDb = runMigrations();

export { db };
