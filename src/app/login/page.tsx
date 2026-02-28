"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.errors?.join(", ") ?? "Something went wrong");
        return;
      }

      router.push("/");
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
        <div className="bg-gb-bg0 rounded-lg border border-gb-bg3 p-6">
          <h1 className="text-xl font-bold text-gb-fg0 mb-1">Loan Tracker</h1>
          <p className="text-sm text-gb-fg4 mb-6">
            {isRegister ? "Create an account" : "Sign in to your account"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gb-fg2 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border border-gb-bg3 bg-gb-bg0 px-3 py-2 text-sm text-gb-fg1 focus:border-gb-blue focus:ring-1 focus:ring-gb-blue outline-none"
                placeholder="username"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gb-fg2 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-gb-bg3 bg-gb-bg0 px-3 py-2 pr-9 text-sm text-gb-fg1 focus:border-gb-blue focus:ring-1 focus:ring-gb-blue outline-none"
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

            {error && <p className="text-sm text-gb-red">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-gb-blue px-4 py-2 text-sm font-medium text-gb-bg0 hover:bg-gb-blue-dim disabled:opacity-50"
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
              className="text-sm text-gb-blue hover:text-gb-blue-dim"
            >
              {isRegister ? "Already have an account? Sign in" : "Need an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
