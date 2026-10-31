"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["pending", "confirmed", "shipping", "arrived", "cancelled"] as const;

const suggestions = [
  "Ready for pickup/delivery around Athurugiriya",
  "Can deliver to Malabe, Kaduwela, Homagama, Maharagama, Pannipitiya, Battaramulla, Rukmalgama",
  "Delivered/handed over",
  "Arrived - ready for pickup",
];

export default function OrderStatus({
  orderId,
  currentStatus,
  currentNote,
}: {
  orderId: string;
  currentStatus: string | null;
  currentNote?: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus ?? "pending");
  const [note, setNote] = useState(currentNote ?? "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setLoading(true);
    setMsg("");
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, shipping_note: note || undefined }),
    });
    setLoading(false);
    if (res.ok) {
      setMsg("Updated");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setMsg(j.error ?? "Failed");
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-line bg-paper px-2 py-1.5 text-[0.75rem] uppercase tracking-[0.11em]"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={save}
          disabled={loading}
          className="border border-ink px-2.5 py-1.5 text-[0.75rem] uppercase tracking-[0.11em] hover:bg-ink hover:text-ivory disabled:opacity-50"
        >
          {loading ? "..." : "Update"}
        </button>
        {msg && <span className="text-[0.7rem] text-clay-dark">{msg}</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setNote(s)}
            className="border border-line px-2 py-1 text-[0.7rem] text-muted hover:border-clay hover:text-ink"
          >
            {s}
          </button>
        ))}
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Shipping note / area (e.g. Athurugiriya area delivery)"
        className="w-full max-w-md border border-line bg-paper px-2 py-1.5 text-[0.85rem]"
      />
    </div>
  );
}
