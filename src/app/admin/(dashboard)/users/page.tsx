import { connection } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getOrderCountsByUser } from "@/lib/order-ownership";
import { isAllowedAdminEmail } from "@/lib/admin-auth";
import Link from "next/link";

export const instant = false;

type AdminUser = {
  id: string;
  email: string;
  created_at: string;
};

export default async function AdminUsersPage() {
  await connection();
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("users")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  const users = (data ?? []) as AdminUser[];
  const orderCountByUser = await getOrderCountsByUser(users.map((u) => u.id));

  return (
    <div className="border border-line bg-ivory">
      <div className="flex flex-wrap items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="eyebrow">Studio Community</p>
          <h2 className="font-display text-2xl text-ink">Registered Accounts</h2>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings"
            className="text-[0.72rem] font-semibold uppercase tracking-wider text-clay-dark hover:underline"
          >
            Admin DB Credentials →
          </Link>
          <span className="text-[0.75rem] uppercase tracking-[0.12em] text-muted">
            {users.length} accounts
          </span>
        </div>
      </div>

      <ul className="divide-y divide-line">
        {users.map((u) => {
          const isAdminAccount = isAllowedAdminEmail(u.email);
          const orderCount = orderCountByUser.get(u.id) ?? 0;

          return (
            <li
              key={u.id}
              className={`flex flex-col gap-3 p-5 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                isAdminAccount ? "bg-amber-50/40" : "hover:bg-paper"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[0.85rem] font-semibold ${
                    isAdminAccount
                      ? "bg-ink text-ivory"
                      : "border border-line bg-paper text-ink"
                  }`}
                >
                  {u.email.charAt(0).toUpperCase()}
                </span>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[0.95rem] font-medium text-ink">{u.email}</p>
                    {isAdminAccount && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100/90 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-amber-900">
                        Admin Account · DB Credential
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-[0.72rem] text-muted">
                    ID: #{u.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-left sm:text-right">
                <div>
                  <span className="inline-block rounded border border-line bg-paper px-2 py-0.5 text-[0.75rem] font-medium text-ink">
                    {orderCount} {orderCount === 1 ? "order" : "orders"}
                  </span>
                  <p className="mt-1 text-[0.75rem] text-muted">
                    Joined{" "}
                    {new Date(u.created_at).toLocaleDateString("en-LK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {isAdminAccount && (
                  <Link
                    href="/admin/settings"
                    className="border border-line bg-ivory px-2.5 py-1 text-[0.72rem] font-medium text-clay-dark hover:border-clay"
                  >
                    Change DB Password
                  </Link>
                )}
              </div>
            </li>
          );
        })}

        {users.length === 0 && (
          <li className="p-8 text-center text-[0.95rem] text-muted">No registered users yet.</li>
        )}
      </ul>
    </div>
  );
}
