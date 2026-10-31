"use client";

import { useEffect, useRef, useState } from "react";
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
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), select, input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    const focusTimer = window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>('a[href], button:not([disabled]), select')
        ?.focus();
    }, 60);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      window.clearTimeout(focusTimer);
      buttonRef.current?.focus();
    };
  }, [open]);

  const panelLink =
    "flex min-h-12 items-center justify-between gap-3 border-b border-line py-3 text-[0.95rem] text-ink transition-colors hover:text-clay-dark";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex h-11 w-11 items-center justify-center border border-line text-ink transition-colors hover:border-clay"
      >
        <span className="relative block h-3.5 w-5" aria-hidden="true">
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
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="sheet-backdrop absolute inset-0 h-full w-full cursor-default bg-ink/45 backdrop-blur-[2px]"
          />

          <div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="sheet-panel absolute inset-y-0 right-0 flex w-[min(21rem,88vw)] flex-col border-l border-line bg-ivory shadow-[0_0_80px_rgba(45,33,27,0.28)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <p className="font-display text-2xl tracking-[0.18em] text-ink">
                  {t(locale, "brand")}
                </p>
                <p className="mt-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted">
                  Ceylon Objects
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="flex h-11 w-11 shrink-0 items-center justify-center border border-line text-ink transition-colors hover:border-clay"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5" fill="none">
                  <path
                    d="m4 4 8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="scroll-area flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              <p className="eyebrow">{t(locale, "collection")}</p>
              <nav aria-label="Mobile primary" className="mt-3 flex flex-col border-t border-line">
                <Link href="/#collection" onClick={close} className={panelLink}>
                  {t(locale, "products")}
                  <span aria-hidden="true" className="text-clay-dark">→</span>
                </Link>
                <Link href="/#story" onClick={close} className={panelLink}>
                  {t(locale, "craft")}
                  <span aria-hidden="true" className="text-clay-dark">→</span>
                </Link>
                <Link href="/#reviews" onClick={close} className={panelLink}>
                  {t(locale, "reviews")}
                  <span aria-hidden="true" className="text-clay-dark">→</span>
                </Link>
              </nav>

              <div className="mt-7">
                {user ? (
                  <>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-clay-dark">
                      {t(locale, "signedIn")}
                    </p>
                    <p className="mt-1 truncate text-sm text-ink">{user.email}</p>
                    <div className="mt-3 flex flex-col border-t border-line">
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
                      className="mt-4 flex min-h-12 w-full items-center justify-center border border-line px-4 py-3 text-center text-[0.75rem] font-medium uppercase tracking-[0.12em] text-clay-dark transition-colors hover:border-clay"
                    >
                      {t(locale, "logout")}
                    </LogoutButton>
                  </>
                ) : (
                  <>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-clay-dark">
                      {t(locale, "account")}
                    </p>
                    <div className="mt-3 flex flex-col border-t border-line">
                      <Link href="/login" onClick={close} className={panelLink}>
                        {t(locale, "login")}
                      </Link>
                      <Link href="/signup" onClick={close} className={panelLink}>
                        {t(locale, "signup")}
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={close} className={panelLink}>
                          {t(locale, "adminDashboard")}
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-line px-5 pb-safe pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  {t(locale, "language")}
                </span>
                <LocaleSwitcher current={locale} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
