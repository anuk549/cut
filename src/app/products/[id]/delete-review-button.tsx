"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setDeleting(true);
    setError("");
    const res = await fetch(`/reviews/${reviewId}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Could not delete feedback.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={remove}
        disabled={deleting}
        className="text-[0.75rem] font-medium uppercase tracking-[0.11em] text-muted underline decoration-line underline-offset-4 transition-colors hover:text-clay-dark disabled:cursor-wait disabled:opacity-60"
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>
      {error && (
        <p role="status" className="max-w-48 text-right text-[0.75rem] leading-5 text-clay-dark">
          {error}
        </p>
      )}
    </div>
  );
}
