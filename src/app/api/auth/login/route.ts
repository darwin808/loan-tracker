import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip).allowed) {
    return NextResponse.json(
      { errors: ["Too many attempts. Please try again later."] },
      { status: 429 }
    );
  }

  await initDb;
  const body = await request.json();

  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ errors: ["Username and password are required"] }, { status: 400 });
  }

  const result = await db.execute({
    sql: "SELECT id, username, password_hash, created_at FROM users WHERE username = ?",
    args: [username],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ errors: ["Invalid username or password"] }, { status: 401 });
  }

  const user = result.rows[0];
  const valid = await verifyPassword(password, user.password_hash as string);
  if (!valid) {
    return NextResponse.json({ errors: ["Invalid username or password"] }, { status: 401 });
  }

  const token = await createSession(user.id as number);
  const res = NextResponse.json({
    id: user.id,
    username: user.username,
    createdAt: user.created_at,
  });
  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
