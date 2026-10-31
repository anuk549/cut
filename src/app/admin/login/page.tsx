"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Invalid email or password. Please check your credentials and try again.");
      }
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="shell flex flex-1 items-center justify-center py-16 lg:py-24">
      <div className="grid w-full max-w-4xl overflow-hidden border border-line bg-paper lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden overflow-hidden bg-ink p-10 text-ivory lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-ivory/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full border border-ivory/10"
          />
          <div className="relative">
            <p className="font-display text-2xl tracking-[0.24em]">MATI</p>
            <p className="mt-2 text-[0.75rem] font-medium uppercase tracking-[0.2em] text-ivory/70">
              Ceylon Objects
            </p>
          </div>
          <div className="relative">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[#d39a7d]">
              The studio
            </p>
            <h1 className="display mt-4 max-w-sm text-5xl">
              Care for every one-of-one piece.
            </h1>
            <p className="mt-5 max-w-xs text-[0.95rem] leading-7 text-ivory/70">
              Add new vessels, keep stock accurate, and prepare the collection for its next
              collector.
            </p>
          </div>
          <div className="relative flex items-center gap-2 text-[0.75rem] font-medium uppercase tracking-[0.15em] text-ivory/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Database Synced · Studio admin only</span>
          </div>
        </aside>

        <div className="p-7 sm:p-10 lg:p-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted transition-colors hover:text-clay-dark"
          >
            <span aria-hidden="true">←</span> Back to storefront
          </Link>

          <p className="eyebrow mt-10">Admin Access</p>
          <h1 className="display mt-3 text-4xl text-ink">Studio Login</h1>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">
            Only authorized studio admins can access this area.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin-email" className="label">
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
                placeholder="Your admin email"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field pr-20"
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((value) => !value)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[0.75rem] font-medium uppercase tracking-[0.1em] text-clay-dark hover:text-ink"
                >
                  {show ? (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.375l1.091 1.091a4 4 0 0 0-5.557-5.557Z" clipRule="evenodd" />
                      </svg>
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                      </svg>
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="border-l-2 border-clay bg-ivory px-3 py-2 text-[0.85rem] leading-5 text-clay-dark">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary mt-2 flex w-full items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ivory border-t-transparent" />
                  <span>Verifying credentials…</span>
                </>
              ) : (
                "Sign in to Studio"
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-line pt-4 text-[0.72rem] text-muted">
            <span className="font-semibold text-ink">Database:</span> Only authorized studio admins in the Supabase database can access this area.
          </div>
        </div>
      </div>
    </div>
  );
}
