import { db, initDb } from "./db";
import type { Bill, BillInput } from "./types";
import type { Row } from "@libsql/client";

function rowToBill(row: Row): Bill {
  return {
    id: row.id as number,
    name: row.name as string,
    amount: row.amount as number,
    frequency: row.frequency as Bill["frequency"],
    startDate: row.start_date as string,
    createdAt: row.created_at as string,
  };
}

export async function getAllBills(userId: number): Promise<Bill[]> {
  await initDb;
  const result = await db.execute({
    sql: "SELECT * FROM bills WHERE user_id = ? ORDER BY created_at DESC",
    args: [userId],
  });
  return result.rows.map(rowToBill);
}

export async function getBillById(id: number, userId: number): Promise<Bill | undefined> {
  await initDb;
  const result = await db.execute({
    sql: "SELECT * FROM bills WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return result.rows.length > 0 ? rowToBill(result.rows[0]) : undefined;
}

export async function createBill(userId: number, input: BillInput): Promise<Bill> {
  await initDb;
  const result = await db.execute({
    sql: "INSERT INTO bills (name, amount, frequency, start_date, user_id) VALUES (?, ?, ?, ?, ?)",
    args: [input.name, input.amount, input.frequency, input.startDate, userId],
  });
  return (await getBillById(Number(result.lastInsertRowid), userId))!;
}

export async function updateBill(id: number, userId: number, input: BillInput): Promise<Bill | undefined> {
  await initDb;
  const result = await db.execute({
    sql: "UPDATE bills SET name = ?, amount = ?, frequency = ?, start_date = ? WHERE id = ? AND user_id = ?",
    args: [input.name, input.amount, input.frequency, input.startDate, id, userId],
  });
  if (result.rowsAffected === 0) return undefined;
  return (await getBillById(id, userId))!;
}

export async function deleteBill(id: number, userId: number): Promise<boolean> {
  await initDb;
  const bill = await getBillById(id, userId);
  if (!bill) return false;
  await db.execute({ sql: "DELETE FROM bill_payments WHERE bill_id = ?", args: [id] });
  const result = await db.execute({ sql: "DELETE FROM bills WHERE id = ? AND user_id = ?", args: [id, userId] });
  return result.rowsAffected > 0;
}
