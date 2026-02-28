"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const OAUTH_ERRORS: Record<string, string> = {
  missing_params: "OAuth login failed. Please try again.",
  invalid_state: "Session expired. Please try again.",
  oauth_failed: "Google sign-in failed. Please try again.",
  access_denied: "Access was denied. Please try again.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get("register") === "1");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() => {
    const oauthError = searchParams.get("error");
    return oauthError ? OAUTH_ERRORS[oauthError] ?? "Something went wrong." : "";
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body: Record<string, string> = { username, password };
      if (isRegister && email) body.email = email;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.errors?.join(", ") ?? "Something went wrong");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gb-bg1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-gb-bg0 nb-card rounded-sm p-6">
          <Link href="/" className="text-xl font-bold text-gb-fg0 mb-1 block">FinTrack</Link>
          <p className="text-sm text-gb-fg4 mb-6">
            {isRegister ? "Create an account" : "Track your loans, bills, and savings"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gb-fg2 mb-1">
                {isRegister ? "Username" : "Username or Email"}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full nb-input rounded-sm bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-blue outline-none"
                placeholder={isRegister ? "username" : "username or email"}
                autoComplete="username"
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-bold text-gb-fg2 mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full nb-input rounded-sm bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-blue outline-none"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gb-fg2 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full nb-input rounded-sm bg-gb-bg0 px-3 py-2 pr-9 text-sm text-gb-fg1 focus:border-gb-blue outline-none"
                  placeholder="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gb-fg4 hover:text-gb-fg2"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="nb-card-sm rounded-sm bg-gb-red-bg px-3 py-2">
                <p className="text-sm font-medium text-gb-red">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full nb-btn rounded-sm bg-gb-blue px-4 py-2.5 text-sm font-bold text-gb-bg0 hover:nb-btn-press disabled:opacity-50"
            >
              {submitting ? "Please wait..." : isRegister ? "Register" : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-sm font-bold text-gb-blue hover:text-gb-blue-dim"
            >
              {isRegister ? "Already have an account? Sign in" : "Need an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
