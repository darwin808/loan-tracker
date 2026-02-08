import { NextResponse } from "next/server";
import { getAllLoans, createLoan } from "@/lib/loans";
import { requireAuth, AuthError } from "@/lib/auth";
import type { LoanInput, Frequency } from "@/lib/types";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const loans = await getAllLoans(userId);
    return NextResponse.json(loans);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 });
    }
    throw e;
  }
}

const VALID_FREQUENCIES: Frequency[] = ["daily", "weekly", "monthly"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth();

    const body = await request.json();
    const errors: string[] = [];

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) errors.push("Name is required");

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) errors.push("Amount must be greater than 0");

    const paymentAmount = Number(body.paymentAmount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) errors.push("Payment amount must be greater than 0");
    if (paymentAmount > amount) errors.push("Payment amount cannot exceed total amount");

    const frequency = body.frequency as Frequency;
    if (!VALID_FREQUENCIES.includes(frequency)) errors.push("Invalid frequency");

    const startDate = body.startDate as string;
    if (!DATE_RE.test(startDate)) errors.push("Invalid start date format");

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const input: LoanInput = { name, amount, paymentAmount, frequency, startDate };
    const loan = await createLoan(userId, input);
    return NextResponse.json(loan, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 });
    }
    throw e;
  }
}
