"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { t, type Locale } from "@/i18n/messages";

export default function ReviewForm({
  locale,
  productId,
  userName,
}: {
  locale: Locale;
  productId: string;
  userName: string | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const honeypot = (document.getElementById("website_url") as HTMLInputElement | null)?.value?.trim() ?? "";
      const res = await fetch("/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment, website_url: honeypot }),
      });
      if (res.ok) {
        setComment("");
        setMsg("Feedback posted");
        router.refresh();
      } else {
        const j = await res.json().catch(() => ({}));
        setMsg(j.error ?? "Failed");
      }
    } catch {
      setMsg("Could not post feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!userName) {
    return (
      <div className="border border-line bg-paper p-5 sm:p-6">
        <h3 className="font-display text-2xl text-ink">{t(locale, "writeReview")}</h3>
        <p className="mt-2 text-[0.95rem] leading-6 text-muted">
          Sign in to leave feedback under your account name.
        </p>
        <Link href="/login" className="btn btn-primary mt-5 w-full">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-line bg-paper p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-display text-2xl text-ink">{t(locale, "writeReview")}</h3>
        <p className="text-[0.75rem] font-medium uppercase tracking-[0.11em] text-muted">
          Posting as <span className="text-ink">{userName}</span>
        </p>
      </div>

      <label className="mt-5 block">
        <span className="label">{t(locale, "rating")}</span>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="field"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} ★
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block">
        <span className="label">{t(locale, "description")}</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="field min-h-28 resize-y"
          placeholder="Tell us how you live with this piece."
        />
      </label>

      <input
        type="text"
        name="website_url"
        id="website_url"
        value=""
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-primary mt-5">
        {loading ? "Posting…" : t(locale, "submitReview")}
      </button>
      {msg && (
        <p
          role="status"
          className={`mt-3 text-[0.85rem] leading-5 ${
            msg === "Feedback posted" ? "text-ink" : "text-clay-dark"
          }`}
        >
          {msg}
        </p>
      )}
    </form>
  );
}
