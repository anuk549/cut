"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const trimmed = identifier.trim();
    if (!trimmed) {
      setLoading(false);
      setMsg("Please enter your email or username.");
      return;
    }

    const emailToSend = trimmed.includes("@") ? trimmed : `${trimmed}@mati.com`;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // If logging in as adminhed@mati.com, route to admin dashboard or account
        if (emailToSend.toLowerCase().startsWith("adminhed@")) {
          router.push("/admin");
        } else {
          router.push("/account");
        }
        router.refresh();
      } else {
        setMsg(data.error ?? "Invalid email or password.");
      }
    } catch {
      setMsg("Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell flex flex-1 items-center justify-center py-16 lg:py-24">
      <div className="w-full max-w-md">
        <p className="eyebrow text-center">MATI · Ceylon Objects</p>
        <form onSubmit={submit} className="mt-5 border border-line bg-paper p-7 sm:p-9 shadow-sm">
          <h1 className="font-display text-4xl text-ink">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Sign in to view your orders, private collection, or studio dashboard.
          </p>

          <label className="mt-7 block">
            <span className="label">Email or Username</span>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="field"
              placeholder="adminhed@mati.com or username"
              type="text"
              autoComplete="username"
              required
              autoFocus
            />
          </label>

          <div className="mt-4 block">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="label mb-0">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[0.72rem] font-medium uppercase tracking-wider text-clay-dark hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field mt-1"
              placeholder="Your password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
            />
          </div>

          {msg && (
            <p className="mt-4 border-l-2 border-clay bg-ivory px-3 py-2 text-[0.85rem] leading-5 text-clay-dark">
              {msg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="btn btn-primary mt-6 w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ivory border-t-transparent" />
                <span>Signing in…</span>
              </>
            ) : (
              "Sign in"
            )}
          </button>

          <p className="mt-6 text-center text-[0.9rem] text-muted">
            New to MATI?{" "}
            <Link
              href="/signup"
              className="border-b border-ink/30 pb-0.5 text-ink hover:text-clay-dark"
            >
              Create an account
            </Link>
          </p>
        </form>

        <p className="mt-5 text-center text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted">
          <Link href="/" className="transition-colors hover:text-clay-dark">
            Return to the collection
          </Link>
        </p>
      </div>
    </div>
  );
}
