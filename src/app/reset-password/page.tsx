"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ tone: "error" | "ok"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    if (password !== confirm) {
      setMsg({ tone: "error", text: "Passwords do not match." });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ tone: "ok", text: "Password updated. You can now sign in." });
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setMsg({ tone: "error", text: data.error ?? "Could not reset password." });
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
          <h1 className="font-display text-4xl text-ink">Choose new password</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Enter a new password for your account.
          </p>

          <label className="mt-7 block">
            <span className="label">New password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              type="password"
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>

          <label className="mt-4 block">
            <span className="label">Confirm new password</span>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="field"
              type="password"
              placeholder="Repeat new password"
              required
              minLength={8}
              autoComplete="new-password"
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
            {loading ? "Resetting…" : "Reset password"}
          </button>

          <p className="mt-6 text-center text-[0.9rem] text-muted">
            <a href="/login" className="border-b border-ink/30 pb-0.5 text-ink hover:text-clay-dark">
              Back to sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="shell flex flex-1 items-center justify-center py-16 lg:py-24">
          <p className="text-[0.85rem] uppercase tracking-[0.14em] text-muted">Loading…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
