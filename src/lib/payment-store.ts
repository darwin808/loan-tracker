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

export async function getAllPayments(userId: number): Promise<Payment[]> {
  await initDb;
  const result = await db.execute({
    sql: "SELECT p.* FROM payments p JOIN loans l ON p.loan_id = l.id WHERE l.user_id = ? ORDER BY p.date ASC",
    args: [userId],
  });
  return result.rows.map(rowToPayment);
}

/** Upsert: insert or update payment for a given loan+date (verifies loan ownership) */
export async function upsertPayment(userId: number, loanId: number, date: string, amount: number): Promise<Payment> {
  await initDb;
  // Verify the loan belongs to this user
  const loan = await db.execute({
    sql: "SELECT id FROM loans WHERE id = ? AND user_id = ?",
    args: [loanId, userId],
  });
  if (loan.rows.length === 0) {
    throw new Error("Loan not found");
  }

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

export async function removePayment(userId: number, loanId: number, date: string): Promise<boolean> {
  await initDb;
  // Verify the loan belongs to this user
  const loan = await db.execute({
    sql: "SELECT id FROM loans WHERE id = ? AND user_id = ?",
    args: [loanId, userId],
  });
  if (loan.rows.length === 0) return false;

  const result = await db.execute({
    sql: "DELETE FROM payments WHERE loan_id = ? AND date = ?",
    args: [loanId, date],
  });
  return result.rowsAffected > 0;
}
