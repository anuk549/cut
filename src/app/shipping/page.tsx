import { getLocale } from "@/lib/locale";
import { t } from "@/i18n/messages";
import Link from "next/link";

export const metadata = {
  title: "Shipping Policy | MATI",
  description: "Shipping and delivery information for MATI orders.",
};

export default async function ShippingPage() {
  const locale = await getLocale();
  const year = new Date().getFullYear();

  return (
    <div className="pb-24">
      <div className="border-b border-line">
        <nav className="shell flex items-center gap-2 py-4 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted">
          <Link href="/" className="transition-colors hover:text-clay-dark">{t(locale, "home")}</Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink/70">Shipping Policy</span>
        </nav>
      </div>
      <div className="shell mt-10 max-w-4xl">
        <p className="eyebrow">Legal</p>
        <h1 className="display mt-4 text-4xl text-ink sm:text-5xl">Shipping Policy</h1>
        <p className="mt-4 text-sm text-muted">Last updated: {year}</p>
        <div className="mt-10 space-y-8 text-muted">
          <section>
            <h2 className="font-display text-2xl text-ink">Processing</h2>
            <p className="mt-3 leading-7">Orders are confirmed directly via the contact channel provided. Processing times depend on order details and will be communicated at confirmation.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink">Delivery</h2>
            <p className="mt-3 leading-7">We ship from MATI, Athurugiriya, Sri Lanka. Delivery method and estimated timeline are discussed at the time of order confirmation based on your location.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink">Customs</h2>
            <p className="mt-3 leading-7">International orders may be subject to customs duties or taxes. These are the responsibility of the recipient.</p>
          </section>
        </div>
        <div className="mt-10 flex flex-wrap gap-4 text-[0.75rem] uppercase tracking-[0.12em]">
          <Link href="/terms" className="text-clay-dark hover:text-ink">Terms & Conditions</Link>
          <Link href="/privacy" className="text-clay-dark hover:text-ink">Privacy Policy</Link>
          <Link href="/refund" className="text-clay-dark hover:text-ink">Refund Policy</Link>
        </div>
      </div>
    </div>
  );
}
