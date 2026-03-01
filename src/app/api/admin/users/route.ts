import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { requireAuth, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    const { role } = await requireAuth();
    if (role !== "superadmin") {
      return NextResponse.json({ errors: ["Forbidden"] }, { status: 403 });
    }
    await initDb;
    const result = await db.execute(
      "SELECT id, username, email, created_at FROM users ORDER BY username"
    );
    const users = result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      email: row.email ?? null,
      createdAt: row.created_at,
    }));
    return NextResponse.json(users);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 });
    }
    throw e;
  }
}
