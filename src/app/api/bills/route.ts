import { NextResponse } from "next/server";
import { getAllBills, createBill } from "@/lib/bills";
import { requireAuth, AuthError } from "@/lib/auth";
import type { BillInput, BillFrequency } from "@/lib/types";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const bills = await getAllBills(userId);
    return NextResponse.json(bills);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 });
    }
    throw e;
  }
}

const VALID_FREQUENCIES: BillFrequency[] = ["monthly", "yearly"];
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

    const frequency = body.frequency as BillFrequency;
    if (!VALID_FREQUENCIES.includes(frequency)) errors.push("Invalid frequency");

    const startDate = body.startDate as string;
    if (!DATE_RE.test(startDate)) errors.push("Invalid start date format");

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const input: BillInput = { name, amount, frequency, startDate };
    const bill = await createBill(userId, input);
    return NextResponse.json(bill, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 });
    }
    throw e;
  }
}
