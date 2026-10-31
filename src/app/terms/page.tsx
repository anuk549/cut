import { getLocale } from "@/lib/locale";
import { t } from "@/i18n/messages";
import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions | MATI",
  description: "Terms and conditions for using MATI and placing orders.",
};

export default async function TermsPage() {
  const locale = await getLocale();
  const year = new Date().getFullYear();

  return (
    <div className="pb-24">
      <div className="border-b border-line">
        <nav className="shell flex items-center gap-2 py-4 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted">
          <Link href="/" className="transition-colors hover:text-clay-dark">
            {t(locale, "home")}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink/70">Terms & Conditions</span>
        </nav>
      </div>
      <div className="shell mt-10 max-w-4xl">
        <p className="eyebrow">Legal</p>
        <h1 className="display mt-4 text-4xl text-ink sm:text-5xl">Terms & Conditions</h1>
        <p className="mt-4 text-sm text-muted">Last updated: {year}</p>
        <div className="prose prose-neutral mt-10 max-w-none space-y-8 text-muted">
          <section>
            <h2 className="font-display text-2xl text-ink">1. Agreement</h2>
            <p className="mt-3 leading-7">
              By accessing this website and placing an order with MATI, you agree to be bound by these Terms & Conditions. If you do not agree, please refrain from using the site.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink">2. Products</h2>
            <p className="mt-3 leading-7">
              All vessels are hand-cast, one-of-one pieces made in Sri Lanka. Slight variations in shape, texture, glaze, and color are inherent to the handmade process and are not considered defects.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink">3. Orders & Payment</h2>
            <p className="mt-3 leading-7">
              Orders are placed via the form and confirmed through direct contact (e.g., WhatsApp). Prices are shown in LKR and may change without notice. Availability is subject to stock at the time of confirmation.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink">4. Shipping & Delivery</h2>
            <p className="mt-3 leading-7">
              Ships from MATI, Athurugiriya, Sri Lanka. Delivery timelines are estimates provided at confirmation. MATI is not liable for delays caused by courier services, customs, or events beyond reasonable control.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink">5. Returns & Refunds</h2>
            <p className="mt-3 leading-7">
              Due to the bespoke, one-of-one nature of products, returns are generally not accepted unless an item arrives damaged or significantly not as described. Any issues must be reported within 48 hours of delivery with photos. See our Refund Policy for details.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink">6. Privacy</h2>
            <p className="mt-3 leading-7">
              We process only the information necessary to fulfill your order (name, contact details). By using this site, you consent to this limited use. See our Privacy Policy for more information.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink">7. Limitation of Liability</h2>
            <p className="mt-3 leading-7">
              To the fullest extent permitted by law, MATI shall not be liable for any indirect, incidental, or consequential damages arising from use of this site or purchased products.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink">8. Changes</h2>
            <p className="mt-3 leading-7">
              These terms may be updated periodically. Continued use of the site constitutes acceptance of the revised terms.
            </p>
          </section>
        </div>
        <div className="mt-10 flex flex-wrap gap-4 text-[0.75rem] uppercase tracking-[0.12em]">
          <Link href="/privacy" className="text-clay-dark hover:text-ink">Privacy Policy</Link>
          <Link href="/refund" className="text-clay-dark hover:text-ink">Refund Policy</Link>
          <Link href="/shipping" className="text-clay-dark hover:text-ink">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
