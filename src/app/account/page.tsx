import { connection } from "next/server";
import { getLocale } from "@/lib/locale";
import { t } from "@/i18n/messages";
import { getCurrentUser } from "@/lib/user-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/logout-button";

export const instant = false;

type Order = {
  id: string;
  quantity: number;
  status: string;
  created_at: string;
  products: { name: string } | null;
};

export default async function AccountPage() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const locale = await getLocale();
  const supabase = createSupabaseAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, products(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="shell py-14 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="eyebrow">{t(locale, "account")}</p>
          <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">{t(locale, "account")}</h1>
          <p className="mt-3 text-[0.95rem] text-muted">{user.email}</p>
        </div>
        <LogoutButton endpoint="/api/auth/logout" redirectTo="/" className="btn btn-outline">
          {t(locale, "logout")}
        </LogoutButton>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:gap-16">
        <div>
          <p className="eyebrow">Orders</p>
          <h2 className="display mt-3 text-3xl text-ink">Your collection</h2>
          <p className="mt-4 max-w-xs text-sm leading-7 text-muted">
            A record of the pieces you have chosen, with your order documents ready to download.
          </p>
          <Link href="/#collection" className="btn btn-link mt-6">
            {t(locale, "heroCta")}
          </Link>
        </div>

        <ul className="border-t border-line">
          {((orders ?? []) as Order[]).length === 0 ? (
            <li className="border-b border-line py-10 text-[0.95rem] text-muted">
              You have not placed an order yet.
            </li>
          ) : (
            ((orders ?? []) as Order[]).map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-5 border-b border-line py-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display text-2xl text-ink">
                    {order.products?.name ?? "Hand-cast piece"}
                    <span className="ml-2 font-sans text-[0.85rem] text-muted">× {order.quantity}</span>
                  </p>
                  <p className="mt-2 text-[0.75rem] font-medium uppercase tracking-[0.11em] text-muted">
                    {order.status} ·{" "}
                    {new Date(order.created_at).toLocaleDateString("en-LK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <a
                  href={`/orders/${order.id}/pdf`}
                  className="btn btn-outline shrink-0"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t(locale, "downloadPdf")}
                </a>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
