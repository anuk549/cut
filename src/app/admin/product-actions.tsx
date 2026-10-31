"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/messages";
import type { AdminProduct } from "./types";
import ProductEditForm from "./product-edit-form";

type Mode = "edit" | "delete" | null;

export default function ProductActions({
  product,
  locale,
}: {
  product: AdminProduct;
  locale: Locale;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!mode) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleting) setMode(null);
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKey);
    };
  }, [mode, deleting]);

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError("");
    const res = await fetch(`/admin/products/${product.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      setMode(null);
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setDeleteError(json.error ?? "Could not delete this piece. Please try again.");
    }
  }

  const actionButton =
    "inline-flex h-9 items-center gap-1.5 border border-line px-2.5 text-[0.75rem] font-medium uppercase tracking-[0.1em] text-ink/70 transition-colors";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("edit")}
          className={`${actionButton} hover:border-clay hover:text-clay-dark`}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3 w-3" fill="none">
            <path
              d="m3 11.5-.5 2 2-.5 7.8-7.8-1.5-1.5L3 11.5ZM9.7 4.3l1.5 1.5"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMode("delete")}
          className={`${actionButton} text-clay-dark hover:border-clay hover:text-clay-dark`}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3 w-3" fill="none">
            <path
              d="M3.5 4.5h9M6 4.5V3h4v1.5M5 4.5l.5 8h5l.5-8M7 7v3.5M9 7v3.5"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Delete
        </button>
        <Link href={`/products/${product.id}`} className={`${actionButton} hover:border-clay hover:text-clay-dark`}>
          View
          <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3 w-3" fill="none">
            <path
              d="M4 12 12 4M6 4h6v6"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      {mode && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-ink/50 p-4 py-8 sm:py-12">
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              if (!deleting) setMode(null);
            }}
            className="fixed inset-0 cursor-default"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-dialog-title"
            className={`relative mx-auto w-full border border-line bg-paper shadow-[0_32px_90px_rgba(45,33,27,0.28)] ${
              mode === "edit" ? "max-w-2xl" : "max-w-md"
            }`}
          >
            {mode === "edit" ? (
              <>
                <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
                  <div>
                    <p className="eyebrow">Edit piece</p>
                    <h2 id="product-dialog-title" className="display mt-2 text-3xl text-ink">
                      {product.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode(null)}
                    aria-label="Close"
                    className="flex h-8 w-8 shrink-0 items-center justify-center border border-line text-ink/70 transition-colors hover:border-clay hover:text-clay-dark"
                  >
                    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5" fill="none">
                      <path
                        d="m4 4 8 8M12 4l-8 8"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <ProductEditForm
                  product={product}
                  locale={locale}
                  onSaved={() => {
                    setMode(null);
                    router.refresh();
                  }}
                  onCancel={() => setMode(null)}
                />
              </>
            ) : (
              <div className="p-6 sm:p-7">
                <p className="eyebrow">Delete piece</p>
                <h2 id="product-dialog-title" className="display mt-2 text-3xl text-ink">
                  Remove {product.name}?
                </h2>
                <p className="mt-3 text-[0.95rem] leading-6 text-muted">
                  This removes the piece and its images from the collection. This cannot be undone.
                </p>

                {deleteError && (
                  <p className="mt-4 border-l-2 border-clay bg-ivory px-3 py-2 text-[0.85rem] leading-5 text-clay-dark">
                    {deleteError}
                  </p>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setMode(null)}
                    disabled={deleting}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="btn btn-primary"
                  >
                    {deleting ? "Deleting..." : "Delete piece"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
