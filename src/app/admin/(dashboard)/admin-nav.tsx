"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    exact: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
        <path d="M2 4.25A2.25 2.25 0 0 1 4.25 2h2.5A2.25 2.25 0 0 1 9 4.25v2.5A2.25 2.25 0 0 1 6.75 9h-2.5A2.25 2.25 0 0 1 2 6.75v-2.5ZM2 13.25A2.25 2.25 0 0 1 4.25 11h2.5A2.25 2.25 0 0 1 9 13.25v2.5A2.25 2.25 0 0 1 6.75 18h-2.5A2.25 2.25 0 0 1 2 15.75v-2.5ZM11 4.25A2.25 2.25 0 0 1 13.25 2h2.5A2.25 2.25 0 0 1 18 4.25v2.5A2.25 2.25 0 0 1 15.75 9h-2.5A2.25 2.25 0 0 1 11 6.75v-2.5ZM11 13.25A2.25 2.25 0 0 1 13.25 11h2.5A2.25 2.25 0 0 1 18 13.25v2.5A2.25 2.25 0 0 1 15.75 18h-2.5A2.25 2.25 0 0 1 11 15.75v-2.5Z" />
      </svg>
    ),
  },
  {
    href: "/admin/products-list",
    label: "Products & Stock",
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
        <path fillRule="evenodd" d="M10 1c3.866 0 7 1.79 7 4s-3.134 4-7 4-7-1.79-7-4 3.134-4 7-4Zm5.694 8.13c.464-.264.91-.583 1.306-.952V10c0 2.21-3.134 4-7 4s-7-1.79-7-4V8.178c.396.37.842.688 1.306.953C5.838 10.005 7.854 10.5 10 10.5s4.162-.495 5.694-1.37ZM3 13.178c.396.37.842.688 1.306.953C5.838 15.005 7.854 15.5 10 15.5s4.162-.495 5.694-1.37c.464-.264.91-.583 1.306-.952V15c0 2.21-3.134 4-7 4s-7-1.79-7-4v-1.822Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
        <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 0 1 8.75 1h2.5A2.75 2.75 0 0 1 14 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.132-1.745 2.53l-1.755.666v2.515a2.75 2.75 0 0 1-2.75 2.75h-3.5A2.75 2.75 0 0 1 5.5 16.25v-2.516l-1.755-.665A2.75 2.75 0 0 1 2 10.539V7.07c0-1.32.947-2.489 2.294-2.676A41.047 41.047 0 0 1 6 4.193V3.75Zm1.5.443v.033c.828.05 1.662.074 2.5.074.838 0 1.672-.024 2.5-.074V3.75a1.25 1.25 0 0 0-1.25-1.25h-2.5A1.25 1.25 0 0 0 7.5 3.75v.443Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Registered Users",
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
        <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Password & DB",
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile Horizontal Bar */}
      <div className="flex overflow-x-auto pb-1 lg:hidden">
        <div className="flex gap-2 min-w-max border border-line bg-ivory p-1.5">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 text-[0.8rem] font-medium transition-colors ${
                  active
                    ? "bg-ink text-ivory shadow-sm"
                    : "text-ink/75 hover:bg-paper hover:text-ink"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop Vertical Sidebar */}
      <aside className="hidden border border-line bg-ivory p-4 lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="px-3 pb-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted border-b border-line">
            Studio Management
          </p>

          <nav className="mt-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-[0.85rem] font-medium transition-all ${
                    active
                      ? "bg-ink text-ivory shadow-sm"
                      : "text-ink/80 hover:bg-paper hover:text-ink"
                  }`}
                >
                  <span className={active ? "text-ivory" : "text-clay-dark"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-line pt-4">
            <p className="px-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted">
              Quick Action
            </p>
            <Link
              href="/admin/products-list"
              className="mt-2 flex items-center justify-between border border-line bg-paper px-3.5 py-2.5 text-[0.82rem] font-medium text-clay-dark transition-colors hover:border-clay hover:text-ink"
            >
              <span>+ Add New Vessel</span>
              <span className="text-[0.75rem] text-muted">Stock</span>
            </Link>
          </div>
        </div>

        {/* Database Sync Indicator at bottom of sidebar */}
        <div className="mt-8 border-t border-line pt-4">
          <div className="flex items-center gap-2 px-3 text-[0.72rem] text-muted">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Database: Synced (Supabase)</span>
          </div>
        </div>
      </aside>
    </>
  );
}
