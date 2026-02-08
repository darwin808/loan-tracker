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

export async function getAllLoans(): Promise<Loan[]> {
  await initDb;
  const result = await db.execute("SELECT * FROM loans ORDER BY created_at DESC");
  return result.rows.map(rowToLoan);
}

export async function getLoanById(id: number): Promise<Loan | undefined> {
  await initDb;
  const result = await db.execute({ sql: "SELECT * FROM loans WHERE id = ?", args: [id] });
  return result.rows.length > 0 ? rowToLoan(result.rows[0]) : undefined;
}

export async function createLoan(input: LoanInput): Promise<Loan> {
  await initDb;
  const result = await db.execute({
    sql: "INSERT INTO loans (name, amount, payment_amount, frequency, start_date) VALUES (?, ?, ?, ?, ?)",
    args: [input.name, input.amount, input.paymentAmount, input.frequency, input.startDate],
  });
  return (await getLoanById(Number(result.lastInsertRowid)))!;
}

export async function updateLoan(id: number, input: LoanInput): Promise<Loan | undefined> {
  await initDb;
  const result = await db.execute({
    sql: "UPDATE loans SET name = ?, amount = ?, payment_amount = ?, frequency = ?, start_date = ? WHERE id = ?",
    args: [input.name, input.amount, input.paymentAmount, input.frequency, input.startDate, id],
  });
  if (result.rowsAffected === 0) return undefined;
  return (await getLoanById(id))!;
}

export async function deleteLoan(id: number): Promise<boolean> {
  await initDb;
  // Delete payments first (cascade may not work on all libsql configs)
  await db.execute({ sql: "DELETE FROM payments WHERE loan_id = ?", args: [id] });
  const result = await db.execute({ sql: "DELETE FROM loans WHERE id = ?", args: [id] });
  return result.rowsAffected > 0;
}
