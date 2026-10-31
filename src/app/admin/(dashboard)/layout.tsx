import Link from "next/link";
import LogoutButton from "@/components/logout-button";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import AdminNav from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-paper">
      <div className="shell py-6 sm:py-8">
        {/* Top Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow">Studio Studio</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live Database
              </span>
            </div>
            <h1 className="display mt-1 text-3xl text-ink sm:text-4xl">Admin Workspace</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/"
              className="btn btn-outline inline-flex items-center gap-1.5 text-[0.75rem]"
            >
              <span>← View Storefront</span>
            </Link>
            <LogoutButton
              endpoint="/api/admin/logout"
              redirectTo="/admin/login"
              className="btn btn-primary text-[0.75rem]"
            >
              Sign out
            </LogoutButton>
          </div>
        </div>

        {/* Navigation & Main Content */}
        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          <AdminNav />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
