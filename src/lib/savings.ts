import { db, initDb } from "./db";
import type { SavingsAccount, SavingsInput } from "./types";
import type { Row } from "@libsql/client";

function rowToAccount(row: Row): SavingsAccount {
  return {
    id: row.id as number,
    name: row.name as string,
    balance: row.balance as number,
    createdAt: row.created_at as string,
  };
}

export async function getAllSavings(userId: number): Promise<SavingsAccount[]> {
  await initDb;
  const result = await db.execute({
    sql: "SELECT * FROM savings WHERE user_id = ? ORDER BY created_at DESC",
    args: [userId],
  });
  return result.rows.map(rowToAccount);
}

export async function getSavingsById(id: number, userId: number): Promise<SavingsAccount | undefined> {
  await initDb;
  const result = await db.execute({
    sql: "SELECT * FROM savings WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return result.rows.length > 0 ? rowToAccount(result.rows[0]) : undefined;
}

export async function createSavings(userId: number, input: SavingsInput): Promise<SavingsAccount> {
  await initDb;
  const result = await db.execute({
    sql: "INSERT INTO savings (user_id, name, balance) VALUES (?, ?, ?)",
    args: [userId, input.name, input.balance],
  });
  return (await getSavingsById(Number(result.lastInsertRowid), userId))!;
}

export async function updateSavings(id: number, userId: number, input: SavingsInput): Promise<SavingsAccount | undefined> {
  await initDb;
  const result = await db.execute({
    sql: "UPDATE savings SET name = ?, balance = ? WHERE id = ? AND user_id = ?",
    args: [input.name, input.balance, id, userId],
  });
  if (result.rowsAffected === 0) return undefined;
  return (await getSavingsById(id, userId))!;
}

export async function deleteSavings(id: number, userId: number): Promise<boolean> {
  await initDb;
  const result = await db.execute({
    sql: "DELETE FROM savings WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return result.rowsAffected > 0;
}
