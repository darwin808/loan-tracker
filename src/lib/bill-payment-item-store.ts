import { db, initDb } from "./db";
import type { BillPaymentItem } from "./types";
import type { Row } from "@libsql/client";

function rowToItem(row: Row): BillPaymentItem {
  return {
    id: row.id as number,
    billId: row.bill_id as number,
    date: row.date as string,
    description: row.description as string,
    amount: row.amount as number,
    createdAt: row.created_at as string,
  };
}

export async function getItemsForBillDate(userId: number, billId: number, date: string): Promise<BillPaymentItem[]> {
  await initDb;
  const result = await db.execute({
    sql: `SELECT i.* FROM bill_payment_items i
          JOIN bills b ON i.bill_id = b.id
          WHERE b.user_id = ? AND i.bill_id = ? AND i.date = ?
          ORDER BY i.created_at ASC`,
    args: [userId, billId, date],
  });
  return result.rows.map(rowToItem);
}

export async function addItem(userId: number, billId: number, date: string, description: string, amount: number): Promise<BillPaymentItem> {
  await initDb;
  const bill = await db.execute({
    sql: "SELECT id FROM bills WHERE id = ? AND user_id = ?",
    args: [billId, userId],
  });
  if (bill.rows.length === 0) throw new Error("Bill not found");

  const result = await db.execute({
    sql: `INSERT INTO bill_payment_items (bill_id, date, description, amount)
          VALUES (?, ?, ?, ?)
          RETURNING *`,
    args: [billId, date, description, amount],
  });
  return rowToItem(result.rows[0]);
}

export async function removeItem(userId: number, itemId: number): Promise<boolean> {
  await initDb;
  const result = await db.execute({
    sql: `DELETE FROM bill_payment_items
          WHERE id = ? AND bill_id IN (SELECT id FROM bills WHERE user_id = ?)`,
    args: [itemId, userId],
  });
  return result.rowsAffected > 0;
}
