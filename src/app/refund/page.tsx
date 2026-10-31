import { getLocale } from "@/lib/locale";
import { t } from "@/i18n/messages";
import Link from "next/link";

export const metadata = {
  title: "Refund Policy | MATI",
  description: "Refund and return policy for MATI orders.",
};

export default async function RefundPage() {
  const locale = await getLocale();
  const year = new Date().getFullYear();

  return (
    <div className="pb-24">
      <div className="border-b border-line">
        <nav className="shell flex items-center gap-2 py-4 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted">
          <Link href="/" className="transition-colors hover:text-clay-dark">{t(locale, "home")}</Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink/70">Refund Policy</span>
        </nav>
      </div>
      <div className="shell mt-10 max-w-4xl">
        <p className="eyebrow">Legal</p>
        <h1 className="display mt-4 text-4xl text-ink sm:text-5xl">Refund Policy</h1>
        <p className="mt-4 text-sm text-muted">Last updated: {year}</p>
        <div className="mt-10 space-y-8 text-muted">
          <section>
            <h2 className="font-display text-2xl text-ink">General Policy</h2>
            <p className="mt-3 leading-7">All MATI pieces are handmade and one-of-one. Due to their bespoke nature, we do not accept returns for change of mind.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink">Damaged or Incorrect Items</h2>
            <p className="mt-3 leading-7">If your item arrives damaged or is significantly different from what was confirmed, please notify us within 48 hours of delivery with clear photos of the item and packaging. We will assess and, where appropriate, offer a replacement or refund.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink">Process</h2>
            <p className="mt-3 leading-7">To initiate a request, contact us through the same channel (e.g., WhatsApp) used to confirm your order with your order ID and photos.</p>
          </section>
        </div>
        <div className="mt-10 flex flex-wrap gap-4 text-[0.75rem] uppercase tracking-[0.12em]">
          <Link href="/terms" className="text-clay-dark hover:text-ink">Terms & Conditions</Link>
          <Link href="/privacy" className="text-clay-dark hover:text-ink">Privacy Policy</Link>
          <Link href="/shipping" className="text-clay-dark hover:text-ink">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
