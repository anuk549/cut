import { connection } from "next/server";
import { getLocale } from "@/lib/locale";
import { t } from "@/i18n/messages";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isProductHidden } from "@/lib/product-visibility";
import { getOwnedReviewIds } from "@/lib/review-ownership";
import { displayNameForEmail, getCurrentUser } from "@/lib/user-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import ImageGallery from "./image-gallery";
import OrderForm from "./order-form";
import ReviewForm from "./review-form";
import DeleteReviewButton from "./delete-review-button";

export const instant = false;

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  premium: boolean;
  discount: number;
  image_urls: string[] | null;
};

type Review = {
  id: string;
  name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

const priceFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

function formatPrice(value: number) {
  return priceFormatter.format(value);
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const locale = await getLocale();
  const supabase = createSupabaseAdminClient();
  const [{ data: product }, hidden, user] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    isProductHidden(id),
    getCurrentUser(),
  ]);
  if (!product) notFound();
  if (hidden && !(await isAdminAuthenticated())) notFound();
  const p = product as Product;
  const ownedReviewIds = user ? await getOwnedReviewIds(user.id) : new Set<string>();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", id)
    .order("created_at", { ascending: false });
  const finalPrice = p.discount ? p.price * (1 - p.discount / 100) : p.price;

  return (
    <div className="pb-24">
      {hidden && (
        <div className="bg-ink text-ivory">
          <p className="shell py-3 text-[0.75rem] font-medium uppercase tracking-[0.12em]">
            Hidden from storefront · admin preview
          </p>
        </div>
      )}
      <div className="border-b border-line">
        <nav
          aria-label="Breadcrumb"
          className="shell flex items-center gap-2 py-4 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted"
        >
          <Link href="/" className="transition-colors hover:text-clay-dark">
            {t(locale, "home")}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/#collection" className="transition-colors hover:text-clay-dark">
            {t(locale, "collection")}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-ink/70">{p.name}</span>
        </nav>
      </div>

      <div className="shell mt-6 grid gap-10 sm:mt-8 sm:gap-12 lg:mt-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        <ImageGallery images={p.image_urls ?? []} alt={p.name} />

        <div className="lg:sticky lg:top-36 lg:self-start">
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow">{t(locale, "craftedIn")}</p>
            <span className="bg-brass/20 px-2.5 py-1 text-[0.75rem] font-medium uppercase tracking-[0.13em] text-clay-dark">
              {t(locale, "oneOfOne")}
            </span>
            {p.premium && (
              <span className="bg-ivory px-2.5 py-1 text-[0.75rem] font-medium uppercase tracking-[0.13em] text-clay-dark">
                {t(locale, "premium")}
              </span>
            )}
          </div>

          <h1 className="display mt-3 text-4xl text-ink sm:mt-4 sm:text-5xl lg:text-6xl">{p.name}</h1>
          <p className="mt-3 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-clay-dark">
            {t(locale, "jewelleryJars")}
          </p>

          <div className="mt-6 flex flex-wrap items-end gap-2 border-b border-line pb-5 sm:mt-7 sm:gap-3 sm:pb-6">
            <span className="font-display text-3xl text-ink">{formatPrice(finalPrice)}</span>
            {p.discount > 0 && (
              <>
                <span className="pb-1 text-[0.95rem] text-muted line-through">{formatPrice(p.price)}</span>
                <span className="mb-1 bg-clay/10 px-2 py-1 text-[0.75rem] font-medium uppercase tracking-[0.11em] text-clay-dark">
                  −{p.discount}%
                </span>
              </>
            )}
          </div>

          <p className="mt-6 text-[1rem] leading-8 text-muted">{p.description}</p>

          <div className="mt-7 flex items-center justify-between border-y border-line py-4 text-[0.75rem] font-medium uppercase tracking-[0.12em]">
            <span className="text-muted">{t(locale, "available")}</span>
            <span className="flex items-center gap-2 text-ink">
              <span
                className={`h-1.5 w-1.5 rounded-full ${p.stock > 0 ? "bg-celadon" : "bg-clay"}`}
              />
              {p.stock > 0 ? p.stock : t(locale, "outOfStock")}
            </span>
          </div>

          {hidden ? (
            <p className="mt-8 border border-line bg-paper px-5 py-4 text-[0.95rem] text-clay-dark">
              This piece is hidden from the storefront. Unhide it to accept orders.
            </p>
          ) : !user ? (
            <div className="mt-8 border border-line bg-paper px-5 py-5">
              <p className="text-[0.95rem] leading-6 text-muted">
                Sign in to place an order and keep it with your account.
              </p>
              <Link href="/login" className="btn btn-primary mt-4 w-full">
                {t(locale, "login")}
              </Link>
            </div>
          ) : p.stock > 0 ? (
            <OrderForm
              locale={locale}
              productId={p.id}
              productName={p.name}
              unitPrice={finalPrice}
              max={p.stock}
              whatsapp={process.env.ADMIN_WHATSAPP ?? ""}
              userName={user ? displayNameForEmail(user.email) : null}
            />
          ) : (
            <p className="mt-8 border border-line bg-paper px-5 py-4 text-[0.95rem] text-clay-dark">
              {t(locale, "outOfStock")}
            </p>
          )}

          <div className="mt-8 border-l-2 border-clay/60 bg-sand/45 px-5 py-4">
            <p className="text-[0.9rem] leading-6 text-muted">{t(locale, "handmadeNote")}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted">
            <span>{t(locale, "handThrown")}</span>
            <span>·</span>
            <span>{t(locale, "smallBatch")}</span>
            <span>·</span>
            <span>{t(locale, "madeInCeylon")}</span>
          </div>
        </div>
      </div>

      <section id="reviews" className="shell mt-14 border-t border-line pt-10 sm:mt-20 sm:pt-14 lg:mt-28">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="eyebrow">{t(locale, "reviewsKicker")}</p>
            <h2 className="display mt-3 text-4xl text-ink">{t(locale, "reviews")}</h2>
            <p className="mt-4 max-w-xs text-[0.95rem] leading-7 text-muted">
              {t(locale, "reviewsSubtitle")}
            </p>
          </div>

          <div>
            <ReviewForm
              locale={locale}
              productId={p.id}
              userName={user ? displayNameForEmail(user.email) : null}
            />
            <ul className="scroll-area mt-8 flex max-h-[36rem] flex-col overflow-y-auto overscroll-contain pr-3">
              {((reviews ?? []) as Review[]).map((review) => (
                <li key={review.id} className="border-t border-line py-6 first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="text-sm tracking-[0.28em] text-brass">
                      {"★".repeat(review.rating)}
                      <span className="text-line">{"★".repeat(5 - review.rating)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[0.75rem] font-medium uppercase tracking-[0.11em] text-muted">
                        {new Date(review.created_at).toLocaleDateString("en-LK", {
                          year: "numeric",
                          month: "short",
                        })}
                      </span>
                      {ownedReviewIds.has(review.id) && (
                        <DeleteReviewButton reviewId={review.id} />
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-[0.95rem] leading-7 text-muted">{review.comment}</p>
                  <p className="mt-3 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-ink/70">
                    {review.name || t(locale, "anonymous")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
