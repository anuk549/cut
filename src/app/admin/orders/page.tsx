import { connection } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import OrderStatus from "../order-status";

export const instant = false;

const priceFormatter = new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 });

function formatPrice(v: number) { return priceFormatter.format(v).replace("LKR", "Rs."); }

export default async function AdminOrdersPage() {
  await connection();
  const supabase = createSupabaseAdminClient();
  const { data: orders } = await supabase.from("orders").select("*, products(name, price)").order("created_at", { ascending: false }).limit(500);
  return (
    <div className="border border-line bg-ivory">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="eyebrow">Orders</p>
          <h2 className="font-display text-2xl text-ink">All Orders</h2>
        </div>
        <p className="text-[0.75rem] uppercase tracking-[0.12em] text-muted">{(orders ?? []).length} orders</p>
      </div>
      <ul className="divide-y divide-line">
        {(orders ?? []).map((order: any) => {
          const total = order.products ? order.products.price * order.quantity : null;
          return (
            <li key={order.id} className="grid gap-4 p-4 sm:grid-cols-[1.2fr_0.9fr_auto] sm:items-start sm:gap-6 sm:p-5">
              <div>
                <p className="font-display text-xl text-ink">{order.products?.name ?? "Removed piece"} <span className="font-sans text-[0.85rem] text-muted">× {order.quantity}</span></p>
                <p className="mt-1 text-[0.75rem] uppercase tracking-[0.1em] text-muted">#{order.id.slice(0,8).toUpperCase()} · {order.status ?? "pending"}</p>
                {order.shipping_note && <p className="mt-1 text-[0.8rem] text-muted">Note: {order.shipping_note}</p>}
                <OrderStatus orderId={order.id} currentStatus={order.status} currentNote={order.shipping_note} />
              </div>
              <div>
                <p className="text-[0.75rem] uppercase tracking-[0.11em] text-muted">Customer</p>
                <p className="mt-1 text-[0.95rem] text-ink">{order.customer_name || "Guest"}</p>
                <p className="mt-0.5 text-[0.85rem] text-muted">{order.customer_phone || "-"}</p>
                {(order as any).customer_email && <p className="mt-0.5 text-[0.85rem] text-muted">{(order as any).customer_email}</p>}
              </div>
              <div className="text-right">
                <p className="text-[0.75rem] uppercase tracking-[0.1em] text-muted">{new Date(order.created_at).toLocaleDateString("en-LK", {day:"numeric",month:"short",year:"numeric"})}</p>
                {total !== null && <p className="mt-1 font-semibold text-ink">{formatPrice(total)}</p>}
                <Link href={`/orders/${order.id}/pdf`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[0.75rem] uppercase tracking-[0.11em] text-clay-dark underline underline-offset-4">Receipt</Link>
              </div>
            </li>
          );
        })}
        {(orders ?? []).length === 0 && <li className="p-5 text-[0.95rem] text-muted">No orders yet.</li>}
      </ul>
    </div>
  );
}
