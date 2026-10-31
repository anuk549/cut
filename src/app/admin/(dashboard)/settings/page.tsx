"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const sqlSnippet = `UPDATE users\nSET password_hash = 'YourNewPasswordHere'\nWHERE email = '';`;

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 8) {
      setMessage({ tone: "error", text: "New password must be at least 8 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ tone: "error", text: "New passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword || undefined,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({
          tone: "success",
          text: "Admin password successfully updated in the database! You can now use it on your next login.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ tone: "error", text: data.error || "Failed to update password." });
      }
    } catch {
      setMessage({ tone: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  function copySql() {
    navigator.clipboard.writeText(sqlSnippet).then(() => {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border border-line bg-ivory p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Studio Security</p>
            <h1 className="font-display text-2xl text-ink sm:text-3xl">Admin Password & Database</h1>
            <p className="mt-1 text-[0.88rem] text-muted">
              Manage your studio password directly here, or edit it directly in your Supabase database.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Supabase DB Synced
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Form: Change Password in Dashboard */}
        <section className="border border-line bg-ivory p-6">
          <div className="border-b border-line pb-4">
            <h2 className="font-display text-xl text-ink">Change Admin Password</h2>
            <p className="mt-1 text-[0.85rem] text-muted">
              Updates your credentials stored in the backend server database (`users` table).
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
            <div>
              <label htmlFor="current-pw" className="label">
                Current Password <span className="text-[0.7rem] font-normal text-muted">(Optional if already logged in)</span>
              </label>
              <input
                id="current-pw"
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="field"
                autoComplete="current-password"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="new-pw" className="label">
                  New Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-[0.72rem] font-medium uppercase tracking-[0.1em] text-clay-dark hover:underline"
                >
                  {showPassword ? "Hide text" : "Show text"}
                </button>
              </div>
              <input
                id="new-pw"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="field"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirm-pw" className="label">
                Confirm New Password
              </label>
              <input
                id="confirm-pw"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="field"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {message && (
              <div
                className={`border-l-2 p-3 text-[0.85rem] leading-5 ${
                  message.tone === "success"
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-900"
                    : "border-clay bg-clay/10 text-clay-dark"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full sm:w-auto"
            >
              {loading ? "Updating in DB…" : "Update Password in Database"}
            </button>
          </form>
        </section>

        {/* Database Info & Instructions */}
        <div className="space-y-6">
          <section className="border border-line bg-ivory p-6">
            <h2 className="font-display text-xl text-ink">Change Directly on Supabase DB</h2>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">
              Your admin password is saved in your Supabase backend. You can change it anytime via the Supabase Table Editor or SQL Editor!
            </p>

            <div className="mt-4 space-y-3 text-[0.82rem] text-ink">
              <div className="rounded border border-line bg-paper p-3">
                <p className="font-semibold text-clay-dark uppercase tracking-wider text-[0.7rem]">
                  Method 1: Supabase Table Editor (Easiest)
                </p>
                <ol className="mt-2 list-inside list-decimal space-y-1.5 text-muted">
                  <li>Open your <strong className="text-ink">Supabase Dashboard</strong>.</li>
                  <li>Click <strong className="text-ink">Table Editor</strong> → Select <strong className="text-ink">users</strong>.</li>
                  <li>Find the row where <strong className="text-ink">email = example@mati.com</strong>.</li>
                  <li>Double-click the <strong className="text-ink">password_hash</strong> column and enter your new password.</li>
                  <li>Save! Plain text is automatically secured with scrypt on next login.</li>
                </ol>
              </div>

              <div className="rounded border border-line bg-paper p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-clay-dark uppercase tracking-wider text-[0.7rem]">
                    Method 2: SQL Query
                  </p>
                  <button
                    type="button"
                    onClick={copySql}
                    className="text-[0.7rem] uppercase tracking-wider text-clay-dark hover:underline"
                  >
                    {copiedSql ? "✓ Copied" : "Copy SQL"}
                  </button>
                </div>
                <pre className="mt-2 overflow-x-auto rounded bg-ink p-3 text-[0.75rem] font-mono text-ivory">
                  {sqlSnippet}
                </pre>
              </div>
            </div>
          </section>

          <section className="border border-line bg-paper p-5">
            <h3 className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Database Configuration Details
            </h3>
            <dl className="mt-3 space-y-2 text-[0.82rem]">
              <div className="flex justify-between border-b border-line pb-1.5">
                <dt className="text-muted">Target DB Table</dt>
                <dd className="font-mono text-ink">public.users</dd>
              </div>
              <div className="flex justify-between border-b border-line pb-1.5">
                <dt className="text-muted">Admin Identifier</dt>
                <dd className="font-mono text-ink">example@mati.com</dd>
              </div>
              <div className="flex justify-between border-b border-line pb-1.5">
                <dt className="text-muted">Password Encryption</dt>
                <dd className="text-ink">scrypt (with plaintext auto-upgrade)</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Fallback Source</dt>
                <dd className="text-ink">ADMIN_PASSWORD_HASH (.env)</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
