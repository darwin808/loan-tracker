import { randomBytes, createHash } from "crypto";
import { db, initDb } from "./db";

// ── Helpers ────────────────────────────────────────────

export function generateOAuthState(): string {
  return randomBytes(32).toString("hex");
}

export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  return { codeVerifier, codeChallenge };
}

// ── Google OAuth ───────────────────────────────────────

export function getGoogleAuthUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<{ access_token: string; id_token: string }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  return res.json();
}

export async function getGoogleUserInfo(
  accessToken: string
): Promise<{ sub: string; email: string; name: string }> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  return res.json();
}

// ── Username generation ────────────────────────────────

export async function generateUsernameFromEmail(email: string): Promise<string> {
  await initDb;
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  const candidate = base.slice(0, 20) || "user";

  // Check if base username is available
  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE username = ?",
    args: [candidate],
  });
  if (existing.rows.length === 0) return candidate;

  // Append numbers until unique
  for (let i = 1; i < 1000; i++) {
    const attempt = `${candidate}${i}`;
    const check = await db.execute({
      sql: "SELECT id FROM users WHERE username = ?",
      args: [attempt],
    });
    if (check.rows.length === 0) return attempt;
  }

  // Fallback to random suffix
  return `${candidate}${randomBytes(4).toString("hex")}`;
}
