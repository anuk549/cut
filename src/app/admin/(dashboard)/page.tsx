import { connection } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export const instant = false;

type RecentOrder = {
  id: string;
  quantity: number;
  status: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email?: string | null;
  created_at: string;
  products: { name: string; price: number } | null;
};

const priceFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

function formatPrice(v: number) {
  return priceFormatter.format(v).replace("LKR", "Rs.");
}

function StatusBadge({ status }: { status: string | null }) {
  const s = (status || "pending").toLowerCase();
  let badgeStyle = "bg-amber-100/80 text-amber-900 border-amber-300";
  if (s === "confirmed") badgeStyle = "bg-sky-100/80 text-sky-900 border-sky-300";
  if (s === "shipping") badgeStyle = "bg-indigo-100/80 text-indigo-900 border-indigo-300";
  if (s === "arrived") badgeStyle = "bg-emerald-100/80 text-emerald-900 border-emerald-300";
  if (s === "cancelled") badgeStyle = "bg-rose-100/80 text-rose-900 border-rose-300";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider ${badgeStyle}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {s}
    </span>
  );
}

export default async function AdminDashboardHome() {
  await connection();
  const supabase = createSupabaseAdminClient();
  const [
    { count: productCount },
    { count: orderCount },
    { count: userCount },
    { data: ordersData },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*, products(name, price)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const orders = (ordersData ?? []) as RecentOrder[];
  const totalVolume = orders.reduce((sum, o) => {
    if (o.status !== "cancelled" && o.products?.price) {
      return sum + o.products.price * (o.quantity || 1);
    }
    return sum;
  }, 0);

  const stats = [
    {
      label: "Inventory Pieces",
      value: productCount ?? 0,
      href: "/admin/products-list",
      sub: "Active vessels in catalog",
    },
    {
      label: "Total Orders",
      value: orderCount ?? 0,
      href: "/admin/orders",
      sub: "Customer requests",
    },
    {
      label: "Registered Users",
      value: userCount ?? 0,
      href: "/admin/users",
      sub: "Accounts in database",
    },
    {
      label: "Recent Volume",
      value: formatPrice(totalVolume),
      href: "/admin/orders",
      sub: "From recent 10 orders",
      isMoney: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Action Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-line bg-ivory p-5">
        <div>
          <p className="eyebrow">Studio Overview</p>
          <h2 className="font-display text-2xl text-ink">Welcome back to Atelier Studio</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products-list"
            className="btn btn-primary text-[0.75rem]"
          >
            + Add New Product
          </Link>
          <Link
            href="/admin/settings"
            className="btn btn-outline text-[0.75rem]"
          >
            Password & DB Settings
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group flex flex-col justify-between border border-line bg-ivory p-5 transition-colors hover:border-clay hover:bg-paper"
          >
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted">
                {s.label}
              </p>
              <p className="display mt-2 text-3xl text-ink transition-transform group-hover:translate-x-0.5">
                {s.value}
              </p>
            </div>
            <p className="mt-4 border-t border-line/60 pt-2 text-[0.75rem] text-muted">
              {s.sub} →
            </p>
          </Link>
        ))}
      </section>

      {/* Recent Orders Table */}
      <section className="border border-line bg-ivory">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="eyebrow">Activity</p>
            <h2 className="font-display text-xl text-ink">Latest Orders</h2>
          </div>
          <Link
            href="/admin/orders"
            className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-clay-dark hover:underline"
          >
            View all orders →
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {orders.map((o) => (
            <li
              key={o.id}
              className="flex flex-col gap-3 p-4 transition-colors hover:bg-paper sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="text-[0.95rem] font-medium text-ink">
                    {o.products?.name ?? "Piece"}
                    <span className="ml-1 text-[0.8rem] text-muted">× {o.quantity}</span>
                  </p>
                  <StatusBadge status={o.status} />
                </div>
                <p className="text-[0.75rem] font-mono tracking-wider text-muted">
                  #{o.id.slice(0, 8).toUpperCase()}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 sm:text-right">
                <div>
                  <p className="text-[0.88rem] font-medium text-ink">{o.customer_name || "Guest"}</p>
                  <p className="text-[0.78rem] text-muted">
                    {o.customer_email || o.customer_phone || "-"}
                  </p>
                </div>
                {o.products?.price && (
                  <p className="font-semibold text-ink sm:min-w-[5rem]">
                    {formatPrice(o.products.price * o.quantity)}
                  </p>
                )}
              </div>
            </li>
          ))}
          {orders.length === 0 && (
            <li className="p-8 text-center text-[0.95rem] text-muted">
              No orders have been placed yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
