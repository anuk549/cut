export const instant = false;
import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getLocale } from "@/lib/locale";
import { t } from "@/i18n/messages";
import LocaleSwitcher from "./locale-switcher";
import HamburgerMenu from "./hamburger-menu";
import AccountMenu from "@/components/account-menu";
import { getCurrentUser } from "@/lib/user-auth";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { connection } from "next/server";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MATI — One-of-one Hand-Cast Vessels from Sri Lanka",
  description:
    "Hand-cast white cement vessels for small jewellery and keepsakes, made one at a time in silicone moulds, slowly dried and hand-glazed in Sri Lanka.",
};

function BrandMark() {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className="h-8 w-8 text-clay"
      fill="none"
    >
      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeOpacity="0.28" />
      <path
        d="M20 29c-6.8 0-11.4-3.7-12.5-9.2 6.2 0 11.2 2.8 12.5 9.2Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <path
        d="M20 29c6.8 0 11.4-3.7 12.5-9.2-6.2 0-11.2 2.8-12.5 9.2Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <path
        d="M20 29V10c-3.7 2.7-5.6 6.1-5.6 9.7 0 3.8 1.9 7.2 5.6 9.3Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
      <path
        d="M20 29V10c3.7 2.7 5.6 6.1 5.6 9.7 0 3.8-1.9 7.2-5.6 9.3Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
    </svg>
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const locale = await getLocale();
  const [user, isAdmin] = await Promise.all([
    getCurrentUser().catch(() => null),
    isAdminAuthenticated().catch(() => false),
  ]);
  const year = new Date().getFullYear();

  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-ivory text-ink">
        <header className="sticky top-0 z-50 border-b border-line/80 bg-ivory/95 backdrop-blur-md">
          <div className="bg-ink px-4 py-2 text-ivory">
            <div className="shell flex items-center justify-between gap-4 text-[0.75rem] font-medium uppercase tracking-[0.16em]">
              <span>{t(locale, "craftedIn")}</span>
              <span className="hidden text-ivory/75 sm:inline">{t(locale, "handThrown")}</span>
            </div>
          </div>
          <div className="shell flex h-16 items-center justify-between gap-4 sm:h-20 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <BrandMark />
              <span className="flex flex-col leading-none">
                <span className="font-display text-[1.4rem] tracking-[0.18em] text-ink sm:text-[1.7rem] sm:tracking-[0.2em]">
                  {t(locale, "brand")}
                </span>
                <span className="mt-1 hidden text-[0.75rem] font-medium uppercase tracking-[0.16em] text-muted sm:inline">
                  Ceylon Objects
                </span>
              </span>
            </Link>

            <nav className="hidden items-center gap-8 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ink/75 md:flex">
              <Link href="/#collection" className="transition-colors hover:text-clay-dark">
                {t(locale, "collection")}
              </Link>
              <Link href="/#story" className="transition-colors hover:text-clay-dark">
                {t(locale, "craft")}
              </Link>
              <Link href="/#reviews" className="transition-colors hover:text-clay-dark">
                {t(locale, "reviews")}
              </Link>
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2 sm:gap-4">
              <LocaleSwitcher current={locale} />
              <div className="hidden md:block">
                <AccountMenu locale={locale} user={user} isAdmin={isAdmin} />
              </div>
              <div className="md:hidden">
                <HamburgerMenu locale={locale} user={user} isAdmin={isAdmin} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-ink text-ivory">
          <div className="shell grid gap-10 py-10 sm:gap-12 sm:py-14 md:grid-cols-[1.5fr_0.75fr_1fr] md:gap-16 md:py-16">
            <div>
              <div className="flex items-center gap-3">
                <BrandMark />
                <span className="font-display text-2xl tracking-[0.18em] sm:text-3xl sm:tracking-[0.2em]">
                  {t(locale, "brand")}
                </span>
              </div>
              <p className="mt-5 max-w-xs text-[0.95rem] leading-7 text-ivory/70">
                {t(locale, "footerNote")}
              </p>
              <p className="mt-3 max-w-xs text-[0.9rem] leading-6 text-ivory/60">
                MATI · Athurugiriya, Sri Lanka
              </p>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[0.75rem] font-medium uppercase tracking-[0.16em] text-ivory/70">
                <span>{t(locale, "handThrown")}</span>
                <span>{t(locale, "smallBatch")}</span>
                <span>{t(locale, "madeInCeylon")}</span>
              </div>
            </div>

            <div>
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-ivory/70">
                {t(locale, "collection")}
              </p>
              <nav className="mt-5 flex flex-col gap-3 text-[0.95rem] text-ivory/80">
                <Link href="/#collection" className="transition-colors hover:text-ivory">
                  {t(locale, "products")}
                </Link>
                <Link href="/#story" className="transition-colors hover:text-ivory">
                  {t(locale, "craft")}
                </Link>
                <Link href="/#reviews" className="transition-colors hover:text-ivory">
                  {t(locale, "reviews")}
                </Link>
                <Link href="/account" className="transition-colors hover:text-ivory">
                  {t(locale, "account")}
                </Link>
              </nav>
            </div>

            <div>
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-ivory/70">
                {t(locale, "atelier")}
              </p>
              <p className="mt-5 max-w-xs text-[0.95rem] leading-7 text-ivory/70">
                {t(locale, "handmadeNote")}
              </p>
              <nav className="mt-5 flex flex-col gap-2 text-[0.9rem] text-ivory/75">
                <Link href="/terms" className="transition-colors hover:text-ivory">Terms & Conditions</Link>
                <Link href="/privacy" className="transition-colors hover:text-ivory">Privacy Policy</Link>
                <Link href="/refund" className="transition-colors hover:text-ivory">Refund Policy</Link>
                <Link href="/shipping" className="transition-colors hover:text-ivory">Shipping Policy</Link>
              </nav>
              <Link
                href="/#collection"
                className="mt-6 inline-flex border-b border-ivory/40 pb-1 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ivory/90 transition-colors hover:border-ivory hover:text-ivory"
              >
                {t(locale, "heroCta")}
              </Link>
            </div>
          </div>
            <div className="border-t border-ivory/10">
              <div className="shell flex flex-col gap-2 py-4 text-[0.7rem] uppercase tracking-[0.12em] text-ivory/65 sm:flex-row sm:items-center sm:justify-between sm:py-5 sm:text-[0.75rem] sm:tracking-[0.13em]">
              <span>
                © {year} {t(locale, "brand")}. {t(locale, "rights")}
              </span>
              <span>{t(locale, "craftedIn")}</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
