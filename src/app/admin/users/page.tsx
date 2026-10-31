import { connection } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const instant = false;

export default async function AdminUsersPage() {
  await connection();
  const supabase = createSupabaseAdminClient();
  const [{ data: users }, { data: orders }] = await Promise.all([
    supabase.from("users").select("id, email, created_at").order("created_at", { ascending: false }),
    supabase.from("orders").select("id, product_id, quantity, status, created_at").order("created_at", { ascending: false }),
  ]);
  const orderCountByUser = new Map<string, number>();
  return (
    <div className="border border-line bg-ivory">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="eyebrow">Users</p>
          <h2 className="font-display text-2xl text-ink">All Users</h2>
        </div>
        <p className="text-[0.75rem] uppercase tracking-[0.12em] text-muted">{(users ?? []).length} users</p>
      </div>
      <ul className="divide-y divide-line">
        {(users ?? []).map((u: any) => (
          <li key={u.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="text-[0.95rem] font-medium text-ink">{u.email}</p>
              <p className="mt-1 text-[0.75rem] uppercase tracking-[0.1em] text-muted">#{u.id.slice(0,8).toUpperCase()}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[0.9rem] text-ink">{orderCountByUser.get(u.id) ?? 0} orders</p>
              <p className="text-[0.8rem] text-muted">{new Date(u.created_at).toLocaleDateString("en-LK", {day:"numeric",month:"short",year:"numeric"})}</p>
            </div>
          </li>
        ))}
        {(users ?? []).length === 0 && <li className="p-5 text-[0.95rem] text-muted">No registered users yet.</li>}
      </ul>
    </div>
  );
}
