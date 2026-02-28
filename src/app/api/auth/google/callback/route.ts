import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, initDb } from "@/lib/db";
import { createSession } from "@/lib/auth";
import {
  exchangeCodeForTokens,
  getGoogleUserInfo,
  generateUsernameFromEmail,
} from "@/lib/oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const appUrl = process.env.APP_URL ?? "";

  // Google returned an error (user denied, etc.)
  if (error) {
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/login?error=missing_params`);
  }

  // Verify state cookie
  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const codeVerifier = cookieStore.get("oauth_code_verifier")?.value;

  if (!storedState || !codeVerifier || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_state`);
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    const googleUser = await getGoogleUserInfo(tokens.access_token);
    const email = googleUser.email.toLowerCase();

    await initDb;

    // 1. Check oauth_accounts by provider + provider_account_id
    const oauthResult = await db.execute({
      sql: "SELECT user_id FROM oauth_accounts WHERE provider = 'google' AND provider_account_id = ?",
      args: [googleUser.sub],
    });

    let userId: number;

    if (oauthResult.rows.length > 0) {
      // Returning OAuth user
      userId = oauthResult.rows[0].user_id as number;
    } else {
      // 2. Check users by email — link existing account
      const emailResult = await db.execute({
        sql: "SELECT id FROM users WHERE email = ?",
        args: [email],
      });

      if (emailResult.rows.length > 0) {
        userId = emailResult.rows[0].id as number;
      } else {
        // 3. Create new user
        const username = await generateUsernameFromEmail(email);
        const insertResult = await db.execute({
          sql: "INSERT INTO users (username, password_hash, email) VALUES (?, '', ?)",
          args: [username, email],
        });
        userId = Number(insertResult.lastInsertRowid);
      }

      // Link OAuth account
      await db.execute({
        sql: "INSERT INTO oauth_accounts (user_id, provider, provider_account_id, email) VALUES (?, 'google', ?, ?)",
        args: [userId, googleUser.sub, email],
      });
    }

    // Create session
    const token = await createSession(userId);

    const res = NextResponse.redirect(`${appUrl}/dashboard`);

    // Set session cookie
    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    // Clear OAuth cookies
    const clearOpts = { httpOnly: true, path: "/", maxAge: 0 } as const;
    res.cookies.set("oauth_state", "", clearOpts);
    res.cookies.set("oauth_code_verifier", "", clearOpts);

    return res;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/login?error=oauth_failed`);
  }
}
