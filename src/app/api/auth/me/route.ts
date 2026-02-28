import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { requireAuth, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    await initDb;
    const result = await db.execute({
      sql: "SELECT id, username, email, password_hash, created_at FROM users WHERE id = ?",
      args: [userId],
    });
    if (result.rows.length === 0) {
      return NextResponse.json({ errors: ["User not found"] }, { status: 401 });
    }
    const user = result.rows[0];
    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email ?? null,
      hasPassword: !!(user.password_hash as string),
      createdAt: user.created_at,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 });
    }
    throw e;
  }
}
