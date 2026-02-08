import { db, initDb } from "./db";
import type { Payment } from "./types";
import type { Row } from "@libsql/client";

function rowToPayment(row: Row): Payment {
  return {
    id: row.id as number,
    loanId: row.loan_id as number,
    date: row.date as string,
    amount: row.amount as number,
    createdAt: row.created_at as string,
  };
}

export async function getAllPayments(): Promise<Payment[]> {
  await initDb;
  const result = await db.execute("SELECT * FROM payments ORDER BY date ASC");
  return result.rows.map(rowToPayment);
}

/** Upsert: insert or update payment for a given loan+date */
export async function upsertPayment(loanId: number, date: string, amount: number): Promise<Payment> {
  await initDb;
  await db.execute({
    sql: `INSERT INTO payments (loan_id, date, amount)
          VALUES (?, ?, ?)
          ON CONFLICT(loan_id, date) DO UPDATE SET amount = excluded.amount`,
    args: [loanId, date, amount],
  });

  const result = await db.execute({
    sql: "SELECT * FROM payments WHERE loan_id = ? AND date = ?",
    args: [loanId, date],
  });
  return rowToPayment(result.rows[0]);
}

export async function removePayment(loanId: number, date: string): Promise<boolean> {
  await initDb;
  const result = await db.execute({
    sql: "DELETE FROM payments WHERE loan_id = ? AND date = ?",
    args: [loanId, date],
  });
  return result.rowsAffected > 0;
}
