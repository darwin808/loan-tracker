import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { requireAuth, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await requireAuth();
    await initDb;
    const result = await db.execute({
      sql: "SELECT id, username, email, password_hash, created_at FROM users WHERE id = ?",
      args: [auth.realUserId],
    });
    if (result.rows.length === 0) {
      return NextResponse.json({ errors: ["User not found"] }, { status: 401 });
    }
    const user = result.rows[0];
    const response: Record<string, unknown> = {
      id: user.id,
      username: user.username,
      email: user.email ?? null,
      hasPassword: !!(user.password_hash as string),
      createdAt: user.created_at,
      role: auth.role,
    };

    if (auth.isImpersonating) {
      const targetResult = await db.execute({
        sql: "SELECT id, username FROM users WHERE id = ?",
        args: [auth.userId],
      });
      if (targetResult.rows.length > 0) {
        const target = targetResult.rows[0];
        response.impersonatingAs = {
          id: target.id,
          username: target.username,
        };
      }
    }

    return NextResponse.json(response);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 });
    }
    throw e;
  }
}
