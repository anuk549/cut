"use client";

import { useState } from "react";
import Link from "next/link";
import { t, type Locale } from "@/i18n/messages";
import LocaleSwitcher from "./locale-switcher";
import LogoutButton from "@/components/logout-button";

export default function HamburgerMenu({
  locale,
  user,
  isAdmin,
}: {
  locale: Locale;
  user: { email: string } | null;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const panelLink =
    "border-b border-line py-3 text-[0.95rem] text-ink transition-colors hover:text-clay-dark";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Menu"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center border border-line text-ink transition-colors hover:border-clay -webkit-tap-highlight-color: transparent"
      >
        <span className="relative block h-3.5 w-5">
          <span
            className={`absolute left-0 h-px w-5 bg-current transition-all ${
              open ? "top-1.5 rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute left-0 top-1.5 h-px w-5 bg-current transition-opacity ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 h-px w-5 bg-current transition-all ${
              open ? "top-1.5 -rotate-45" : "top-3"
            }`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] border border-line bg-ivory p-5 shadow-[0_24px_60px_rgba(45,33,27,0.16)] sm:w-72 sm:p-6">
          <p className="eyebrow">{t(locale, "collection")}</p>
          <nav className="mt-4 flex flex-col border-t border-line">
            <Link href="/#collection" onClick={close} className={panelLink}>
              {t(locale, "products")}
            </Link>
            <Link href="/#story" onClick={close} className={panelLink}>
              {t(locale, "craft")}
            </Link>
            <Link href="/#reviews" onClick={close} className={panelLink}>
              {t(locale, "reviews")}
            </Link>
          </nav>

          <div className="mt-5">
            {user ? (
              <>
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-clay-dark">
                  {t(locale, "signedIn")}
                </p>
                <p className="mt-1 truncate text-sm text-ink">{user.email}</p>
                <div className="mt-3 flex flex-col">
                  <Link href="/account" onClick={close} className={panelLink}>
                    {t(locale, "accountDetails")}
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={close} className={panelLink}>
                      {t(locale, "adminDashboard")}
                    </Link>
                  )}
                </div>
                <LogoutButton
                  endpoint="/api/auth/logout"
                  redirectTo="/"
                  className="mt-4 w-full border border-line py-3 text-center text-[0.75rem] font-medium uppercase tracking-[0.12em] text-clay-dark transition-colors hover:border-clay"
                >
                  {t(locale, "logout")}
                </LogoutButton>
              </>
            ) : (
              <>
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-clay-dark">
                  {t(locale, "account")}
                </p>
                <div className="mt-3 flex flex-col">
                  <Link href="/login" onClick={close} className={panelLink}>
                    {t(locale, "login")}
                  </Link>
                  <Link href="/signup" onClick={close} className={panelLink}>
                    {t(locale, "signup")}
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="mt-5 flex justify-end border-t border-line pt-5">
            <LocaleSwitcher current={locale} />
          </div>
        </div>
      )}
    </div>
  );
}
