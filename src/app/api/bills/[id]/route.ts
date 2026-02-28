import { NextResponse } from "next/server";
import { updateBill, deleteBill, getBillById } from "@/lib/bills";
import { requireAuth, AuthError } from "@/lib/auth";
import type { BillInput, BillFrequency } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

const VALID_FREQUENCIES: BillFrequency[] = ["weekly", "biweekly", "monthly", "yearly"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await requireAuth();
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ errors: ["Invalid ID"] }, { status: 400 });
    }

    const existing = await getBillById(id, userId);
    if (!existing) {
      return NextResponse.json({ errors: ["Bill not found"] }, { status: 404 });
    }

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
    const bill = await updateBill(id, userId, input);
    return NextResponse.json(bill);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 });
    }
    throw e;
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { userId } = await requireAuth();
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ errors: ["Invalid ID"] }, { status: 400 });
    }

    const deleted = await deleteBill(id, userId);
    if (!deleted) {
      return NextResponse.json({ errors: ["Bill not found"] }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 });
    }
    throw e;
  }
}
