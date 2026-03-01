import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { db, initDb } from "./db";
import { cookies, headers } from "next/headers";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (err, derived) => {
      if (err) reject(err);
      else resolve(derived);
    });
  });
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  const storedHash = Buffer.from(hashHex, "hex");
  const derived = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (err, buf) => {
      if (err) reject(err);
      else resolve(buf);
    });
  });
  return timingSafeEqual(storedHash, derived);
}

export async function createSession(userId: number): Promise<string> {
  await initDb;
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await db.execute({
    sql: "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    args: [token, userId, expiresAt],
  });
  return token;
}

export async function getSession(token: string): Promise<{ userId: number } | null> {
  await initDb;
  const result = await db.execute({
    sql: "SELECT user_id, expires_at FROM sessions WHERE id = ?",
    args: [token],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  if (new Date(row.expires_at as string) < new Date()) {
    await db.execute({ sql: "DELETE FROM sessions WHERE id = ?", args: [token] });
    return null;
  }
  return { userId: row.user_id as number };
}

export async function deleteSession(token: string): Promise<void> {
  await initDb;
  await db.execute({ sql: "DELETE FROM sessions WHERE id = ?", args: [token] });
}

export interface AuthResult {
  userId: number;
  realUserId: number;
  role: string;
  isImpersonating: boolean;
}

export async function requireAuth(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) throw new AuthError();
  const session = await getSession(token);
  if (!session) throw new AuthError();

  await initDb;
  const userResult = await db.execute({
    sql: "SELECT role FROM users WHERE id = ?",
    args: [session.userId],
  });
  const role = (userResult.rows[0]?.role as string) ?? "user";

  const headerStore = await headers();
  const impersonateHeader = headerStore.get("x-impersonate-user");

  if (impersonateHeader && role === "superadmin") {
    const targetId = Number(impersonateHeader);
    if (!Number.isNaN(targetId)) {
      const targetResult = await db.execute({
        sql: "SELECT id FROM users WHERE id = ?",
        args: [targetId],
      });
      if (targetResult.rows.length > 0) {
        return {
          userId: targetId,
          realUserId: session.userId,
          role,
          isImpersonating: true,
        };
      }
    }
  }

  return {
    userId: session.userId,
    realUserId: session.userId,
    role,
    isImpersonating: false,
  };
}

export class AuthError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AuthError";
  }
}
