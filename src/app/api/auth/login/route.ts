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

  const login = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!login || !password) {
    return NextResponse.json({ errors: ["Username/email and password are required"] }, { status: 400 });
  }

  const result = await db.execute({
    sql: "SELECT id, username, email, password_hash, created_at FROM users WHERE username = ? OR email = ?",
    args: [login, login],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ errors: ["Invalid username or password"] }, { status: 401 });
  }

  const user = result.rows[0];
  const passwordHash = user.password_hash as string;

  // OAuth-only users have empty password_hash
  if (!passwordHash) {
    return NextResponse.json(
      { errors: ["This account uses Google sign-in. Please use the Google button to log in."] },
      { status: 400 }
    );
  }

  const valid = await verifyPassword(password, passwordHash);
  if (!valid) {
    return NextResponse.json({ errors: ["Invalid username or password"] }, { status: 401 });
  }

  const token = await createSession(user.id as number);
  const res = NextResponse.json({
    id: user.id,
    username: user.username,
    email: user.email ?? null,
    createdAt: user.created_at,
  });
  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
