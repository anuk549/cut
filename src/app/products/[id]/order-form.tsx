"use client";

import { useState } from "react";
import { t, type Locale } from "@/i18n/messages";

const priceFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

function formatPrice(value: number) {
  return priceFormatter.format(value);
}

const deliveryOptions = [
  "I can come to Athurugiriya and pick it up",
  "Please deliver to me",
];

const areaOptions = [
  "Athurugiriya",
  "Malabe",
  "Kaduwela",
  "Homagama",
  "Maharagama",
  "Pannipitiya",
  "Battaramulla",
  "Rukmalgama",
  "Other",
];

export default function OrderForm({
  locale,
  productId,
  productName,
  unitPrice,
  max,
  whatsapp,
  userName,
}: {
  locale: Locale;
  productId: string;
  productName: string;
  unitPrice: number;
  max: number;
  whatsapp: string;
  userName?: string | null;
}) {
  const [qty, setQty] = useState(1);
  const name = userName ?? "";
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState(deliveryOptions[0]);
  const [area, setArea] = useState(areaOptions[0]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [placedQty, setPlacedQty] = useState(1);
  const [msg, setMsg] = useState("");
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const locInput = document.getElementById("deliveryLocation") as HTMLInputElement | null;
    let deliveryNote = delivery === "Please deliver to me" ? `${delivery} | Area: ${area}` : delivery;
    if (delivery === "Please deliver to me" && locInput?.value) deliveryNote += ` | Location: ${locInput.value}`;
    try {
      const res = await fetch("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty, customerName: name, customerPhone: phone, deliveryNote }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        setOrderId(j.orderId);
        setPlacedQty(j.quantity ?? qty);
      } else {
        setMsg(j.error ?? "Failed");
      }
    } catch {
      setMsg("Could not place the order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function getWhatsAppUrl() {
    if (!orderId) return "";
    const receiptUrl = `${window.location.origin}/orders/${orderId}/pdf`;
    const productUrl = `${window.location.origin}/products/${productId}`;
    const message = [
      "New MATI order",
      "",
      `Piece: ${productName}`,
      `Quantity: ${placedQty}`,
      `Total: ${formatPrice(unitPrice * placedQty)}`,
      `Name: ${name || "—"}`,
      `Phone: ${phone || "—"}`,
      `Delivery: ${(() => {
        const locInput = document.getElementById("deliveryLocation") as HTMLInputElement | null;
        let dn = delivery === "Please deliver to me" ? `${delivery} | Area: ${area}` : delivery;
        if (delivery === "Please deliver to me" && locInput?.value) dn += ` | Location: ${locInput.value}`;
        return dn;
      })()}`,
      `Order ID: ${orderId}`,
      `Product: ${productUrl}`,
      `Receipt PDF: ${receiptUrl}`,
    ].join("\n");
    const number = whatsapp.replace(/\D/g, "");
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  async function sharePdf() {
    if (!orderId) return;
    setSharing(true);
    setMsg("");
    try {
      const res = await fetch(`/orders/${orderId}/pdf`);
      if (!res.ok) throw new Error("Could not generate PDF");
      const blob = await res.blob();
      const file = new File([blob], `MATI-order-${orderId.slice(0, 8)}.pdf`, {
        type: "application/pdf",
      });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "MATI order receipt",
          text: `MATI order ${orderId}`,
          files: [file],
        });
      } else {
        window.open(`/orders/${orderId}/pdf`, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setMsg("Could not share the PDF. Please download it instead.");
      }
    } finally {
      setSharing(false);
    }
  }

  if (orderId) {
    const whatsappUrl = getWhatsAppUrl();

    return (
      <div       className="mt-6 border border-line bg-paper p-4 sm:mt-8 sm:p-6">
        <p className="eyebrow">{t(locale, "orderPlaced")}</p>
        <p className="mt-3 font-display text-3xl leading-snug text-ink">
          {t(locale, "receiptReady")}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-line py-4">
          <div>
            <dt className="label">{t(locale, "orderId")}</dt>
            <dd className="font-mono text-sm text-ink">{orderId.slice(0, 8).toUpperCase()}</dd>
          </div>
          <div className="text-right">
            <dt className="label">{t(locale, "total")}</dt>
            <dd className="font-display text-2xl text-ink">
              {formatPrice(unitPrice * placedQty)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-[0.9rem] leading-6 text-muted">{t(locale, "whatsappNote")}</p>

        <div className="mt-5 flex flex-col gap-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full"
            >
              {t(locale, "whatsappOrder")}
              <span aria-hidden="true">→</span>
            </a>
          )}
          <button
            type="button"
            onClick={sharePdf}
            disabled={sharing}
            className="btn btn-outline w-full"
          >
            {sharing ? "Preparing…" : t(locale, "sharePdf")}
          </button>
          <a
            href={`/orders/${orderId}/pdf`}
            className="btn btn-link w-full"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t(locale, "downloadPdf")}
          </a>
        </div>
        {msg && <p className="mt-3 text-[0.85rem] leading-5 text-clay-dark">{msg}</p>}
      </div>
    );
  }

  return (
    <>
      <form onSubmit={submit} className="mt-6 border border-line bg-paper p-4 sm:mt-8 sm:p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">{t(locale, "order")}</h2>
          <span className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted">
            {t(locale, "available")} · {max}
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label">{t(locale, "quantity")}</span>
            <select
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="field"
            >
              {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label className="sm:col-span-2">
            <span className="label">{t(locale, "name")}</span>
            <input
              value={name}
              readOnly
              className="field bg-sand/60"
              placeholder="Your name"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="label">Delivery / Pickup</span>
            <select value={delivery} onChange={(e) => setDelivery(e.target.value)} className="field">
              {deliveryOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>

          {delivery === "Please deliver to me" && (
            <>
              <label className="sm:col-span-2">
                <span className="label">Area</span>
                <select value={area} onChange={(e) => setArea(e.target.value)} className="field">
                  {areaOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sm:col-span-2">
                <span className="label">Location / Address</span>
                <input
                  id="deliveryLocation"
                  placeholder="Enter your full address / landmark"
                  className="field"
                />
              </label>
            </>
          )}
        </div>

        <label className="mt-4 block">
          <span className="label">{t(locale, "phone")}</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="field"
            placeholder="+94"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            minLength={7}
            required
          />
        </label>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm">
          <span className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted">
            {t(locale, "total")}
          </span>
          <span className="font-display text-2xl text-ink">{formatPrice(unitPrice * qty)}</span>
        </div>

        <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-primary mt-4 w-full">
          {loading ? "Placing order…" : t(locale, "orderNow")}
        </button>
        {msg && <p className="mt-3 text-[0.85rem] leading-5 text-clay-dark">{msg}</p>}
      </form>

      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
            `Hello MATI, I would like to ask about ${productName}.`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline mt-3 w-full"
        >
          {t(locale, "whatsappAtelier")}
        </a>
      )}
    </>
  );
}
