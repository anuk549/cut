"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VisibilityToggle({
  productId,
  productName,
  hidden,
}: {
  productId: string;
  productName: string;
  hidden: boolean;
}) {
  const router = useRouter();
  const [isHidden, setIsHidden] = useState(hidden);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function toggle(next: boolean) {
    setSaving(true);
    setError("");
    setIsHidden(next);

    const res = await fetch(`/admin/products/${productId}/visibility`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hidden: next }),
    });

    setSaving(false);

    if (!res.ok) {
      setIsHidden(!next);
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Could not update visibility.");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <label
        className={`inline-flex h-9 cursor-pointer items-center gap-2 border px-2.5 text-[0.75rem] font-medium uppercase tracking-[0.1em] transition-colors ${
          isHidden
            ? "border-clay bg-ivory text-clay-dark"
            : "border-line text-ink/70 hover:border-clay"
        } ${saving ? "cursor-wait opacity-60" : ""}`}
      >
        <input
          type="checkbox"
          checked={isHidden}
          disabled={saving}
          onChange={(event) => toggle(event.target.checked)}
          aria-label={`Hide ${productName} from the storefront`}
          className="h-4 w-4 accent-[var(--clay)]"
        />
        {isHidden ? "Hidden" : "Visible"}
      </label>
      {error && (
        <p role="status" className="mt-2 text-[0.75rem] leading-5 text-clay-dark">
          {error}
        </p>
      )}
    </div>
  );
}
