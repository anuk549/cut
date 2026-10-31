import { connection } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export const instant = false;

export default async function AdminDashboardHome() {
  await connection();
  const supabase = createSupabaseAdminClient();
  const [{ count: productCount }, { count: orderCount }, { count: userCount }, { data: ordersData }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*, products(name)").order("created_at", { ascending: false }).limit(10),
  ]);

  const stats = [
    { label: "Products", value: productCount ?? 0, href: "/admin/products-list" },
    { label: "Orders", value: orderCount ?? 0, href: "/admin/orders" },
    { label: "Users", value: userCount ?? 0, href: "/admin/users" },
  ];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="border border-line bg-ivory p-5 hover:bg-paper">
            <p className="text-[0.75rem] uppercase tracking-[0.13em] text-muted">{s.label}</p>
            <p className="display mt-2 text-4xl text-ink">{s.value}</p>
          </Link>
        ))}
      </section>

      <section className="border border-line bg-ivory">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="eyebrow">Recent</p>
            <h2 className="font-display text-2xl text-ink">Latest Orders</h2>
          </div>
          <Link href="/admin/orders" className="text-[0.75rem] uppercase tracking-[0.12em] text-clay-dark">View all</Link>
        </div>
        <ul className="divide-y divide-line">
          {(ordersData ?? []).map((o: any) => (
            <li key={o.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <p className="text-[0.95rem] font-medium text-ink">{o.products?.name ?? "Piece"} × {o.quantity}</p>
                <p className="mt-1 text-[0.75rem] uppercase tracking-[0.1em] text-muted">#{o.id.slice(0, 8)} · {o.status ?? "pending"}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[0.9rem] text-ink">{o.customer_name || "Guest"}</p>
                <p className="text-[0.8rem] text-muted">{(o as any).customer_email || o.customer_phone || "-"}</p>
              </div>
            </li>
          ))}
          {(ordersData ?? []).length === 0 && (
            <li className="p-5 text-[0.95rem] text-muted">No orders yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
