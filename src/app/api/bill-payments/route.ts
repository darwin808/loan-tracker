import { NextResponse } from "next/server";
import { getAllBillPayments, upsertBillPayment, removeBillPayment } from "@/lib/bill-payment-store";
import { requireAuth, AuthError } from "@/lib/auth";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const payments = await getAllBillPayments(userId);
    return NextResponse.json(payments);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 });
    }
    throw e;
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const errors: string[] = [];

    const billId = Number(body.billId);
    if (!Number.isInteger(billId)) {
      errors.push("Invalid bill ID");
    }

    const date = body.date as string;
    if (!DATE_RE.test(date)) errors.push("Invalid date format");

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) errors.push("Amount must be greater than 0");

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const payment = await upsertBillPayment(userId, billId, date, amount);
    return NextResponse.json(payment, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 });
    }
    if (e instanceof Error && e.message === "Bill not found") {
      return NextResponse.json({ errors: ["Bill not found"] }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);
    const billId = Number(searchParams.get("billId"));
    const date = searchParams.get("date") ?? "";

    if (!Number.isInteger(billId) || !date) {
      return NextResponse.json({ errors: ["billId and date required"] }, { status: 400 });
    }

    const deleted = await removeBillPayment(userId, billId, date);
    if (!deleted) {
      return NextResponse.json({ errors: ["Payment not found"] }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 });
    }
    throw e;
  }
}
