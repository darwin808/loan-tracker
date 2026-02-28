import { db, initDb } from "./db";
import type { BillPayment } from "./types";
import type { Row } from "@libsql/client";

function rowToBillPayment(row: Row): BillPayment {
  return {
    id: row.id as number,
    billId: row.bill_id as number,
    date: row.date as string,
    amount: row.amount as number,
    createdAt: row.created_at as string,
  };
}

export async function getAllBillPayments(userId: number): Promise<BillPayment[]> {
  await initDb;
  const result = await db.execute({
    sql: "SELECT bp.* FROM bill_payments bp JOIN bills b ON bp.bill_id = b.id WHERE b.user_id = ? ORDER BY bp.date ASC",
    args: [userId],
  });
  return result.rows.map(rowToBillPayment);
}

export async function upsertBillPayment(userId: number, billId: number, date: string, amount: number): Promise<BillPayment> {
  await initDb;
  const bill = await db.execute({
    sql: "SELECT id FROM bills WHERE id = ? AND user_id = ?",
    args: [billId, userId],
  });
  if (bill.rows.length === 0) {
    throw new Error("Bill not found");
  }

  await db.execute({
    sql: `INSERT INTO bill_payments (bill_id, date, amount)
          VALUES (?, ?, ?)
          ON CONFLICT(bill_id, date) DO UPDATE SET amount = excluded.amount`,
    args: [billId, date, amount],
  });

  const result = await db.execute({
    sql: "SELECT * FROM bill_payments WHERE bill_id = ? AND date = ?",
    args: [billId, date],
  });
  return rowToBillPayment(result.rows[0]);
}

export async function removeBillPayment(userId: number, billId: number, date: string): Promise<boolean> {
  await initDb;
  const bill = await db.execute({
    sql: "SELECT id FROM bills WHERE id = ? AND user_id = ?",
    args: [billId, userId],
  });
  if (bill.rows.length === 0) return false;

  const result = await db.execute({
    sql: "DELETE FROM bill_payments WHERE bill_id = ? AND date = ?",
    args: [billId, date],
  });
  return result.rowsAffected > 0;
}
