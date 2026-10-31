import { connection } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import OrderStatus from "../order-status";

export const instant = false;

const priceFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

function formatPrice(v: number) {
  return priceFormatter.format(v).replace("LKR", "Rs.");
}

type AdminOrder = {
  id: string;
  quantity: number;
  status: string | null;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_note?: string | null;
  customer_email?: string | null;
  products: { name: string; price: number } | null;
};

function StatusBadge({ status }: { status: string | null }) {
  const s = (status || "pending").toLowerCase();
  let badgeStyle = "bg-amber-100/90 text-amber-900 border-amber-300";
  if (s === "confirmed") badgeStyle = "bg-sky-100/90 text-sky-900 border-sky-300";
  if (s === "shipping") badgeStyle = "bg-indigo-100/90 text-indigo-900 border-indigo-300";
  if (s === "arrived") badgeStyle = "bg-emerald-100/90 text-emerald-900 border-emerald-300";
  if (s === "cancelled") badgeStyle = "bg-rose-100/90 text-rose-900 border-rose-300";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider ${badgeStyle}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {s}
    </span>
  );
}

export default async function AdminOrdersPage() {
  await connection();
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, products(name, price)")
    .order("created_at", { ascending: false })
    .limit(500);

  const orders = (data ?? []) as AdminOrder[];

  return (
    <div className="border border-line bg-ivory">
      <div className="flex flex-wrap items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="eyebrow">Studio Orders</p>
          <h2 className="font-display text-2xl text-ink">Orders Management</h2>
        </div>
        <div className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted">
          Total: <span className="font-semibold text-ink">{orders.length} orders</span>
        </div>
      </div>

      <ul className="divide-y divide-line">
        {orders.map((order) => {
          const total = order.products ? order.products.price * order.quantity : null;
          return (
            <li
              key={order.id}
              className="grid gap-5 p-5 transition-colors hover:bg-paper/40 lg:grid-cols-[1.3fr_1fr_auto] lg:items-start"
            >
              {/* Product & Status Control */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="font-display text-xl text-ink">
                    {order.products?.name ?? "Removed piece"}
                  </p>
                  <span className="font-sans text-[0.8rem] text-muted">× {order.quantity}</span>
                  <StatusBadge status={order.status} />
                </div>

                <p className="text-[0.72rem] font-mono uppercase tracking-wider text-muted">
                  ID: #{order.id.slice(0, 8).toUpperCase()}
                </p>

                {order.shipping_note && (
                  <div className="rounded border border-line bg-paper px-3 py-2 text-[0.82rem] text-ink">
                    <span className="font-medium text-clay-dark">Note: </span>
                    {order.shipping_note}
                  </div>
                )}

                <OrderStatus
                  orderId={order.id}
                  currentStatus={order.status}
                  currentNote={order.shipping_note}
                />
              </div>

              {/* Customer Info */}
              <div className="rounded border border-line/60 bg-paper/50 p-3.5 space-y-1">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  Customer
                </p>
                <p className="text-[0.95rem] font-medium text-ink">{order.customer_name || "Guest"}</p>
                <p className="text-[0.85rem] text-muted">{order.customer_phone || "No phone"}</p>
                {order.customer_email && (
                  <p className="text-[0.82rem] text-muted">{order.customer_email}</p>
                )}
              </div>

              {/* Date & Receipt */}
              <div className="flex flex-col items-start gap-2 lg:items-end">
                <p className="text-[0.75rem] font-mono text-muted">
                  {new Date(order.created_at).toLocaleDateString("en-LK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                {total !== null && (
                  <p className="font-display text-xl text-ink">{formatPrice(total)}</p>
                )}
                <Link
                  href={`/orders/${order.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 border border-line bg-paper px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-clay-dark hover:border-clay hover:text-ink"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                    <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z" />
                  </svg>
                  <span>Receipt PDF</span>
                </Link>
              </div>
            </li>
          );
        })}

        {orders.length === 0 && (
          <li className="p-8 text-center text-[0.95rem] text-muted">No orders found.</li>
        )}
      </ul>
    </div>
  );
}
