"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ tone: "error" | "ok"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ tone: "ok", text: "If that email exists, a password reset link has been sent." });
      } else {
        setMsg({ tone: "error", text: data.error ?? "Could not send reset link." });
      }
    } catch {
      setMsg({ tone: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell flex flex-1 items-center justify-center py-16 lg:py-24">
      <div className="w-full max-w-md">
        <p className="eyebrow text-center">MATI · Ceylon Objects</p>
        <form onSubmit={submit} className="mt-5 border border-line bg-paper p-7 sm:p-9 shadow-sm">
          <h1 className="font-display text-4xl text-ink">Reset password</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Enter your account email and we will send you a secure reset link.
          </p>

          <label className="mt-7 block">
            <span className="label">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          {msg && (
            <p
              role="status"
              className={`mt-4 text-[0.85rem] leading-5 ${
                msg.tone === "ok" ? "text-ink" : "text-clay-dark"
              }`}
            >
              {msg.text}
            </p>
          )}

          <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-primary mt-6 w-full">
            {loading ? "Sending…" : "Send reset link"}
          </button>

          <p className="mt-6 text-center text-[0.9rem] text-muted">
            Remembered it?{" "}
            <Link href="/login" className="border-b border-ink/30 pb-0.5 text-ink hover:text-clay-dark">
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
