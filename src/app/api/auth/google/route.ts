import { NextResponse } from "next/server";
import { generateOAuthState, generatePKCE, getGoogleAuthUrl } from "@/lib/oauth";

export async function GET() {
  const state = generateOAuthState();
  const { codeVerifier, codeChallenge } = generatePKCE();
  const url = getGoogleAuthUrl(state, codeChallenge);

  const res = NextResponse.redirect(url);

  // Store state + PKCE verifier in httpOnly cookies (10 min TTL)
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600, // 10 minutes
  };

  res.cookies.set("oauth_state", state, cookieOpts);
  res.cookies.set("oauth_code_verifier", codeVerifier, cookieOpts);

  return res;
}
