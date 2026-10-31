"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { t, type Locale } from "@/i18n/messages";
import type { AdminProduct } from "./types";

export default function ProductEditForm({
  product,
  locale,
  onSaved,
  onCancel,
}: {
  product: AdminProduct;
  locale: Locale;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<string[]>([]);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [discount, setDiscount] = useState(String(product.discount));
  const [premium, setPremium] = useState(product.premium);
  const [images, setImages] = useState<string[]>(
    (product.image_urls ?? []).filter((url): url is string => typeof url === "string"),
  );
  const [files, setFiles] = useState<FileList | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const previewUrls = previewsRef;
    return () => previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function releasePreviews() {
    previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewsRef.current = [];
  }

  function chooseFiles(next: FileList | null) {
    releasePreviews();
    const urls = next ? Array.from(next).map((file) => URL.createObjectURL(file)) : [];
    previewsRef.current = urls;
    setPreviews(urls);
    setFiles(next);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("premium", String(premium));
    formData.append("discount", discount);
    formData.append("keepImages", JSON.stringify(images));
    if (files) {
      Array.from(files).forEach((file) => formData.append("images", file));
    }

    const res = await fetch(`/admin/products/${product.id}`, {
      method: "PATCH",
      body: formData,
    });
    setSaving(false);

    if (res.ok) {
      onSaved();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Could not save this piece. Please try again.");
    }
  }

  const imageCount = images.length + (files?.length ?? 0);
  const atLimit = imageCount >= 8;

  return (
    <form onSubmit={submit}>
      <div className="space-y-4 px-5 py-5 sm:px-6">
        <div>
          <label htmlFor="edit-product-name" className="label">
            {t(locale, "name")}
          </label>
          <input
            id="edit-product-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field"
            required
          />
        </div>

        <div>
          <label htmlFor="edit-product-description" className="label">
            {t(locale, "description")}
          </label>
          <textarea
            id="edit-product-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="field min-h-24 resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-product-price" className="label">
              {t(locale, "price")} (LKR)
            </label>
            <input
              id="edit-product-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="field"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-product-stock" className="label">
              Stock
            </label>
            <input
              id="edit-product-stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="field"
              type="number"
              min="0"
              step="1"
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-product-discount" className="label">
            Discount
          </label>
          <div className="relative">
            <input
              id="edit-product-discount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="field pr-10"
              type="number"
              min="0"
              max="100"
              step="1"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">%</span>
          </div>
        </div>

        <label
          className={`flex cursor-pointer items-start gap-3 border p-3.5 transition-colors ${
            premium ? "border-clay bg-ivory" : "border-line hover:border-clay/60"
          }`}
        >
          <input
            type="checkbox"
            checked={premium}
            onChange={(e) => setPremium(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--clay)]"
          />
          <span>
            <span className="block text-[0.75rem] font-medium uppercase tracking-[0.11em] text-ink">
              Atelier piece
            </span>
            <span className="mt-1 block text-[0.85rem] leading-5 text-muted">
              Highlight this vessel as a special piece in the collection.
            </span>
          </span>
        </label>

        <div>
          <div className="flex items-end justify-between gap-3">
            <span className="label mb-0">Images</span>
            <span className="pb-1 text-[0.75rem] font-medium uppercase tracking-[0.1em] text-muted">
              {imageCount} of 8
            </span>
          </div>

          {images.length > 0 && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {images.map((url) => (
                <div key={url} className="relative aspect-square overflow-hidden border border-line bg-sand">
                  <Image src={url} alt="" fill sizes="110px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((current) => current.filter((image) => image !== url))}
                    aria-label="Remove image"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-ink/80 text-sm leading-none text-ivory transition-colors hover:bg-clay"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <label
            htmlFor="edit-product-images"
            className={`mt-2 flex flex-col items-center border border-dashed px-4 py-5 text-center transition-colors ${
              atLimit
                ? "cursor-not-allowed border-line bg-ivory/40 opacity-55"
                : "cursor-pointer border-line bg-ivory/60 hover:border-clay"
            }`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 text-clay" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span className="mt-2 text-[0.78rem] font-medium uppercase tracking-[0.1em] text-ink">
              {files?.length ? `${files.length} new selected` : "Add more images"}
            </span>
            <span className="mt-1 text-[0.75rem] uppercase tracking-[0.08em] text-muted">
              Multiple images · 8 MB each
            </span>
          </label>
          <input
            ref={fileInputRef}
            id="edit-product-images"
            type="file"
            multiple
            accept="image/*"
            disabled={atLimit}
            onChange={(e) => chooseFiles(e.target.files)}
            className="sr-only"
          />

          {previews.length > 0 && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {previews.map((preview) => (
                <div
                  key={preview}
                  className="relative aspect-square overflow-hidden border border-clay bg-sand"
                >
                  <Image src={preview} alt="" fill sizes="110px" unoptimized className="object-cover" />
                  <span className="absolute left-1 top-1 bg-clay-dark px-1.5 py-0.5 text-[0.75rem] font-medium uppercase tracking-[0.08em] text-ivory">
                    New
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="border-l-2 border-clay bg-ivory px-3 py-2 text-[0.85rem] leading-5 text-clay-dark">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
