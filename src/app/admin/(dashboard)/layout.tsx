import Link from "next/link";
import LogoutButton from "@/components/logout-button";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-paper">
      <div className="shell py-6 sm:py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Studio</p>
            <h1 className="display mt-2 text-3xl text-ink sm:text-4xl">Admin Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="btn btn-outline">Storefront</Link>
            <LogoutButton endpoint="/api/admin/logout" redirectTo="/admin/login" className="btn btn-primary">Logout</LogoutButton>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="border border-line bg-ivory p-3 sm:p-4">
            <nav className="flex flex-col gap-1">
              <Link href="/admin" className="px-3 py-2 text-[0.9rem] hover:bg-paper">Dashboard</Link>
              <Link href="/admin/products-list" className="px-3 py-2 text-[0.9rem] hover:bg-paper">Add / Manage Products</Link>
              <Link href="/admin/orders" className="px-3 py-2 text-[0.9rem] hover:bg-paper">All Orders</Link>
              <Link href="/admin/users" className="px-3 py-2 text-[0.9rem] hover:bg-paper">Users</Link>
            </nav>
            <div className="mt-4 border-t border-line pt-4">
              <p className="px-3 text-[0.7rem] uppercase tracking-[0.14em] text-muted">Quick</p>
              <Link href="/admin/products-list" className="mt-2 inline-flex px-3 py-2 text-[0.9rem] text-clay-dark hover:text-ink">+ Add Item</Link>
            </div>
          </aside>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
