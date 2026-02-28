import { NextResponse } from "next/server";
import { getAllSavings, createSavings } from "@/lib/savings";
import { requireAuth, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const accounts = await getAllSavings(userId);
    return NextResponse.json(accounts);
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

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) errors.push("Name is required");

    const balance = Number(body.balance);
    if (!Number.isFinite(balance) || balance < 0) errors.push("Balance must be 0 or greater");

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const account = await createSavings(userId, { name, balance });
    return NextResponse.json(account, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 });
    }
    throw e;
  }
}
