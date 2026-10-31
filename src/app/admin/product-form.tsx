"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { t, type Locale } from "@/i18n/messages";

export default function ProductForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<string[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [stock, setStock] = useState("0");
  const [premium, setPremium] = useState(false);
  const [discount, setDiscount] = useState("0");
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const previews = previewsRef;
    return () => previews.current.forEach((url) => URL.revokeObjectURL(url));
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

  function clearFiles() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    releasePreviews();
    setFiles(null);
    setPreviews([]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description);
    fd.append("price", price);
    fd.append("stock", stock);
    fd.append("premium", String(premium));
    fd.append("discount", discount);
    if (files) {
      Array.from(files).forEach((file) => fd.append("images", file));
    }
    const res = await fetch("/admin/products", { method: "POST", body: fd });
    setLoading(false);
    if (res.ok) {
      setName("");
      setDescription("");
      setPrice("");
      setStock("0");
      setPremium(false);
      setDiscount("0");
      clearFiles();
      setFeedback({ tone: "success", text: "Piece added to the collection." });
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setFeedback({
        tone: "error",
        text: json.error ?? "Could not add this piece. Please try again.",
      });
    }
  }

  return (
    <form onSubmit={submit} className="border border-line bg-paper">
      <div className="border-b border-line p-5 sm:p-6">
        <p className="eyebrow">New piece</p>
        <h2 className="display mt-2 text-3xl text-ink">{t(locale, "createProduct")}</h2>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div>
          <label htmlFor="product-name" className="label">
            {t(locale, "name")}
          </label>
          <input
            id="product-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field"
            placeholder="Moonstone keepsake jar"
            required
          />
        </div>

        <div>
          <label htmlFor="product-description" className="label">
            {t(locale, "description")}
          </label>
          <textarea
            id="product-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="field min-h-28 resize-y"
            placeholder="Hand-cast in white cement, slowly dried and hand-glazed."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="product-price" className="label">
              {t(locale, "price")} (LKR)
            </label>
            <input
              id="product-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="field"
              placeholder="4500"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label htmlFor="product-stock" className="label">
              Stock
            </label>
            <input
              id="product-stock"
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
          <label htmlFor="product-discount" className="label">
            Discount
          </label>
          <div className="relative">
            <input
              id="product-discount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="field pr-10"
              placeholder="0"
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
          <span className="label">Images</span>
          <label
            htmlFor="product-images"
            className="flex cursor-pointer flex-col items-center border border-dashed border-line bg-ivory/60 px-4 py-6 text-center transition-colors hover:border-clay"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-6 w-6 text-clay"
              fill="none"
            >
              <path
                d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <circle cx="9" cy="10" r="1.4" fill="currentColor" />
              <path
                d="m6 17 4.2-4.2 3 3 2.1-2.1L20 17.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="mt-3 text-[0.8rem] font-medium uppercase tracking-[0.1em] text-ink">
              {files?.length ? `${files.length} selected` : "Choose images"}
            </span>
            <span className="mt-1 text-[0.75rem] uppercase tracking-[0.08em] text-muted">
              JPG, PNG or WEBP · up to 8 · 8 MB each
            </span>
          </label>
          <input
            ref={fileInputRef}
            id="product-images"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => chooseFiles(e.target.files)}
            className="sr-only"
          />

          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {previews.map((preview) => (
                <div key={preview} className="relative aspect-square overflow-hidden border border-line bg-sand">
                  <Image src={preview} alt="" fill sizes="80px" unoptimized className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {feedback && (
          <p
            role="status"
            aria-live="polite"
            className={`border-l-2 px-3 py-2 text-[0.85rem] leading-5 ${
              feedback.tone === "success"
                ? "border-celadon bg-ivory text-ink"
                : "border-clay bg-ivory text-clay-dark"
            }`}
          >
            {feedback.text}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Adding..." : t(locale, "create")}
        </button>
        <p className="text-center text-[0.75rem] uppercase tracking-[0.1em] text-muted">
          Stock 0 keeps the piece visible but not orderable.
        </p>
      </div>
    </form>
  );
}
