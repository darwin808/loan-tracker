import { NextResponse } from "next/server";
import { updateSavings, deleteSavings, getSavingsById } from "@/lib/savings";
import { requireAuth, AuthError } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await requireAuth();
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ errors: ["Invalid ID"] }, { status: 400 });
    }

    const existing = await getSavingsById(id, userId);
    if (!existing) {
      return NextResponse.json({ errors: ["Account not found"] }, { status: 404 });
    }

    const body = await request.json();
    const errors: string[] = [];

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) errors.push("Name is required");

    const balance = Number(body.balance);
    if (!Number.isFinite(balance) || balance < 0) errors.push("Balance must be 0 or greater");

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const account = await updateSavings(id, userId, { name, balance });
    return NextResponse.json(account);
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

    const deleted = await deleteSavings(id, userId);
    if (!deleted) {
      return NextResponse.json({ errors: ["Account not found"] }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 });
    }
    throw e;
  }
}
