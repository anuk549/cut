"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { t, type Locale } from "@/i18n/messages";
import LogoutButton from "./logout-button";

type AccountUser = { email: string } | null;

export default function AccountMenu({
  locale,
  user,
  isAdmin,
}: {
  locale: Locale;
  user: AccountUser;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initial = user?.email?.charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const menuLink =
    "block px-3 py-2.5 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-ink/80 transition-colors hover:bg-paper hover:text-clay-dark-dark";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t(locale, "account")}
        aria-expanded={open}
        className="flex h-9 items-center gap-2 border border-line px-2.5 text-[0.75rem] font-medium uppercase tracking-[0.13em] text-ink/80 transition-colors hover:border-clay hover:text-ink"
      >
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.75rem] font-semibold ${
            user ? "bg-ink text-ivory" : "border border-line text-ink/70"
          }`}
        >
          {initial ?? (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5" fill="none">
              <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M5.5 20c.5-3.9 3-5.9 6.5-5.9s6 2 6.5 5.9"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
        <span>{t(locale, "account")}</span>
        <svg
          viewBox="0 0 12 12"
          aria-hidden="true"
          className={`h-2.5 w-2.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
        >
          <path d="m2.5 4.5 3.5 3 3.5-3" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 border border-line bg-ivory p-2 shadow-[0_24px_60px_rgba(45,33,27,0.16)]">
          {user ? (
            <>
              <div className="border-b border-line px-3 py-3">
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-clay-dark">
                  {t(locale, "signedIn")}
                </p>
                <p className="mt-1 truncate text-sm text-ink">{user.email}</p>
              </div>
              <div className="pt-2">
                <Link href="/account" onClick={() => setOpen(false)} className={menuLink}>
                  {t(locale, "accountDetails")}
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setOpen(false)} className={menuLink}>
                    {t(locale, "adminDashboard")}
                  </Link>
                )}
              </div>
              <div className="mt-2 border-t border-line pt-2">
                <LogoutButton
                  endpoint="/api/auth/logout"
                  redirectTo="/"
                  className="block w-full px-3 py-2.5 text-left text-[0.75rem] font-medium uppercase tracking-[0.12em] text-clay-dark transition-colors hover:bg-paper"
                >
                  {t(locale, "logout")}
                </LogoutButton>
              </div>
            </>
          ) : (
            <>
              <div className="border-b border-line px-3 py-3">
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-clay-dark">
                  MATI Atelier
                </p>
                <p className="mt-1 font-display text-xl text-ink">Your private collection</p>
              </div>
              <div className="pt-2">
                <Link href="/login" onClick={() => setOpen(false)} className={menuLink}>
                  {t(locale, "login")}
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className={menuLink}>
                  {t(locale, "signup")}
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setOpen(false)} className={menuLink}>
                    {t(locale, "adminDashboard")}
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
