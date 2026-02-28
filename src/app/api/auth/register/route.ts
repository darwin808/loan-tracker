import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

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
  const errors: string[] = [];

  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  if (username.length < 3) errors.push("Username must be at least 3 characters");
  else if (!USERNAME_RE.test(username)) errors.push("Username must be alphanumeric (underscores allowed)");

  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 8) errors.push("Password must be at least 8 characters");

  const email = typeof body.email === "string" && body.email.trim() ? body.email.trim().toLowerCase() : null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email format");
  }

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Check username uniqueness
  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE username = ?",
    args: [username],
  });
  if (existing.rows.length > 0) {
    return NextResponse.json({ errors: ["Username already taken"] }, { status: 409 });
  }

  // Check email uniqueness
  if (email) {
    const emailExists = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    });
    if (emailExists.rows.length > 0) {
      return NextResponse.json({ errors: ["Email already in use"] }, { status: 409 });
    }
  }

  const passwordHash = await hashPassword(password);
  const result = await db.execute({
    sql: "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)",
    args: [username, passwordHash, email],
  });
  const userId = Number(result.lastInsertRowid);

  // First user claims orphan loans
  const userCount = await db.execute("SELECT COUNT(*) as cnt FROM users");
  if ((userCount.rows[0].cnt as number) === 1) {
    await db.execute({
      sql: "UPDATE loans SET user_id = ? WHERE user_id IS NULL",
      args: [userId],
    });
  }

  const token = await createSession(userId);
  const res = NextResponse.json({ id: userId, username, email, createdAt: new Date().toISOString() }, { status: 201 });
  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
