"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [emailLocal, setEmailLocal] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const email = emailLocal.trim() ? `${emailLocal.trim()}@mati.com` : "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    if (!emailLocal.trim()) {
      setLoading(false);
      setMsg("Enter your username");
      return;
    }
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/account");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setMsg(j.error ?? "Failed");
    }
  }

  return (
    <div className="shell flex flex-1 items-center justify-center py-16 lg:py-24">
      <div className="w-full max-w-md">
        <p className="eyebrow text-center">MATI · Ceylon Objects</p>
        <form onSubmit={submit} className="mt-5 border border-line bg-paper p-7 sm:p-9">
          <h1 className="font-display text-4xl text-ink">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Sign in to view your orders and account details.
          </p>

          <label className="mt-7 block">
            <span className="label">Username</span>
            <div className="flex">
              <input
                value={emailLocal}
                onChange={(e) => setEmailLocal(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ""))}
                className="field rounded-none"
                placeholder="yourname"
                type="text"
              />
              <span className="flex items-center border border-l-0 border-line bg-paper px-3 text-sm text-muted">@mati.com</span>
            </div>
          </label>

          <label className="mt-4 block">
            <span className="label">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              placeholder="Your password"
              type="password"
            />
          </label>

          {msg && <p className="mt-4 text-[0.85rem] leading-5 text-clay-dark">{msg}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary mt-6 w-full">
            {loading ? "..." : "Sign in"}
          </button>

          <p className="mt-6 text-center text-[0.9rem] text-muted">
            New to MATI?{" "}
            <Link href="/signup" className="border-b border-ink/30 pb-0.5 text-ink hover:text-clay-dark">
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
