import { NextResponse } from "next/server";
import { getAllPayments, upsertPayment, removePayment } from "@/lib/payment-store";
import { getLoanById } from "@/lib/loans";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  const payments = await getAllPayments();
  return NextResponse.json(payments);
}

export async function POST(request: Request) {
  const body = await request.json();
  const errors: string[] = [];

  const loanId = Number(body.loanId);
  if (!Number.isInteger(loanId) || !(await getLoanById(loanId))) {
    errors.push("Invalid loan ID");
  }

  const date = body.date as string;
  if (!DATE_RE.test(date)) errors.push("Invalid date format");

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) errors.push("Amount must be greater than 0");

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const payment = await upsertPayment(loanId, date, amount);
  return NextResponse.json(payment, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const loanId = Number(searchParams.get("loanId"));
  const date = searchParams.get("date") ?? "";

  if (!Number.isInteger(loanId) || !date) {
    return NextResponse.json({ errors: ["loanId and date required"] }, { status: 400 });
  }

  const deleted = await removePayment(loanId, date);
  if (!deleted) {
    return NextResponse.json({ errors: ["Payment not found"] }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
