"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("That password is not correct. Please try again.");
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
          <p className="relative text-[0.75rem] font-medium uppercase tracking-[0.15em] text-ivory/70">
            Private access · Admin only
          </p>
        </aside>

        <div className="p-7 sm:p-10 lg:p-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted transition-colors hover:text-clay-dark"
          >
            <span aria-hidden="true">←</span> Back to storefront
          </Link>

          <p className="eyebrow mt-10">Admin access</p>
          <h1 className="display mt-3 text-4xl text-ink">Studio login</h1>
          <p className="mt-3 max-w-sm text-[0.95rem] leading-7 text-muted">
            Enter the admin password to manage the MATI collection.
          </p>

          <form onSubmit={submit} className="mt-8">
            <label htmlFor="admin-password" className="label">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field pr-16"
                placeholder="Enter your password"
                autoComplete="current-password"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShow((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.75rem] font-medium uppercase tracking-[0.1em] text-clay-dark"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>

            {error && (
              <p className="mt-4 border-l-2 border-clay bg-ivory px-3 py-2 text-[0.85rem] leading-5 text-clay-dark">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary mt-5 w-full">
              {loading ? "Checking..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 border-t border-line pt-5 text-[0.75rem] font-medium uppercase tracking-[0.11em] text-muted">
            Protected studio area
          </p>
        </div>
      </div>
    </div>
  );
}
