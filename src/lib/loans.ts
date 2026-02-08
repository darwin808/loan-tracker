import { db, initDb } from "./db";
import type { Loan, LoanInput } from "./types";
import type { Row } from "@libsql/client";

function rowToLoan(row: Row): Loan {
  return {
    id: row.id as number,
    name: row.name as string,
    amount: row.amount as number,
    paymentAmount: row.payment_amount as number,
    frequency: row.frequency as Loan["frequency"],
    startDate: row.start_date as string,
    createdAt: row.created_at as string,
  };
}

export async function getAllLoans(userId: number): Promise<Loan[]> {
  await initDb;
  const result = await db.execute({
    sql: "SELECT * FROM loans WHERE user_id = ? ORDER BY created_at DESC",
    args: [userId],
  });
  return result.rows.map(rowToLoan);
}

export async function getLoanById(id: number, userId: number): Promise<Loan | undefined> {
  await initDb;
  const result = await db.execute({
    sql: "SELECT * FROM loans WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return result.rows.length > 0 ? rowToLoan(result.rows[0]) : undefined;
}

export async function createLoan(userId: number, input: LoanInput): Promise<Loan> {
  await initDb;
  const result = await db.execute({
    sql: "INSERT INTO loans (name, amount, payment_amount, frequency, start_date, user_id) VALUES (?, ?, ?, ?, ?, ?)",
    args: [input.name, input.amount, input.paymentAmount, input.frequency, input.startDate, userId],
  });
  return (await getLoanById(Number(result.lastInsertRowid), userId))!;
}

export async function updateLoan(id: number, userId: number, input: LoanInput): Promise<Loan | undefined> {
  await initDb;
  const result = await db.execute({
    sql: "UPDATE loans SET name = ?, amount = ?, payment_amount = ?, frequency = ?, start_date = ? WHERE id = ? AND user_id = ?",
    args: [input.name, input.amount, input.paymentAmount, input.frequency, input.startDate, id, userId],
  });
  if (result.rowsAffected === 0) return undefined;
  return (await getLoanById(id, userId))!;
}

export async function deleteLoan(id: number, userId: number): Promise<boolean> {
  await initDb;
  // Verify ownership before deleting
  const loan = await getLoanById(id, userId);
  if (!loan) return false;
  await db.execute({ sql: "DELETE FROM payments WHERE loan_id = ?", args: [id] });
  const result = await db.execute({ sql: "DELETE FROM loans WHERE id = ? AND user_id = ?", args: [id, userId] });
  return result.rowsAffected > 0;
}
