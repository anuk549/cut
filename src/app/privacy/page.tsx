import { getLocale } from "@/lib/locale";
import { t } from "@/i18n/messages";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | MATI",
  description: "How MATI collects, uses, and protects your information.",
};

export default async function PrivacyPage() {
  const locale = await getLocale();
  const year = new Date().getFullYear();

  return (
    <div className="pb-24">
      <div className="border-b border-line">
        <nav className="shell flex items-center gap-2 py-4 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted">
          <Link href="/" className="transition-colors hover:text-clay-dark">{t(locale, "home")}</Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink/70">Privacy Policy</span>
        </nav>
      </div>
      <div className="shell mt-10 max-w-4xl">
        <p className="eyebrow">Legal</p>
        <h1 className="display mt-4 text-4xl text-ink sm:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-muted">Last updated: {year}</p>
        <div className="mt-10 space-y-8 text-muted">
          <section>
            <h2 className="font-display text-2xl text-ink">Information We Collect</h2>
            <p className="mt-3 leading-7">We collect only what is needed to process orders: your name, phone number, and order details. Account features may collect your email address for authentication.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink">How We Use Information</h2>
            <p className="mt-3 leading-7">Information is used solely to confirm and fulfill orders, communicate about your purchase, and maintain account access. We do not sell your personal data.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink">Data Storage</h2>
            <p className="mt-3 leading-7">Data is stored securely using industry-standard practices. Access is restricted to authorized purposes only.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink">Cookies</h2>
            <p className="mt-3 leading-7">We use essential cookies for session and locale preferences. No third-party advertising cookies are used.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink">Your Rights</h2>
            <p className="mt-3 leading-7">You may request correction or deletion of your personal information by contacting us through the order channel used for your purchase.</p>
          </section>
        </div>
        <div className="mt-10 flex flex-wrap gap-4 text-[0.75rem] uppercase tracking-[0.12em]">
          <Link href="/terms" className="text-clay-dark hover:text-ink">Terms & Conditions</Link>
          <Link href="/refund" className="text-clay-dark hover:text-ink">Refund Policy</Link>
          <Link href="/shipping" className="text-clay-dark hover:text-ink">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
