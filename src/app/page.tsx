import { connection } from "next/server";
import { getLocale } from "@/lib/locale";
import { t } from "@/i18n/messages";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getHiddenProductIds } from "@/lib/product-visibility";
import VesselArt from "@/components/vessel-art";
import AutoScrollCollection from "./auto-scroll-collection";

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
  product_id: string;
  name: string | null;
  rating: number;
  comment: string | null;
  products: { name: string } | null;
};

const priceFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

function formatPrice(value: number) {
  return priceFormatter.format(value);
}

function CraftMotif() {
  const petals = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <svg viewBox="0 0 480 480" aria-hidden="true" className="h-full w-full">
      <circle cx="240" cy="240" r="214" stroke="#b08a46" strokeOpacity="0.38" fill="none" />
      <circle cx="240" cy="240" r="184" stroke="#b08a46" strokeOpacity="0.22" fill="none" />
      <circle cx="240" cy="240" r="152" stroke="#b45f3c" strokeOpacity="0.2" fill="none" />
      <g fill="none" stroke="#b45f3c" strokeOpacity="0.42">
        {petals.map((angle) => (
          <g key={angle} transform={`rotate(${angle} 240 240)`}>
            <path d="M240 78c-22 46-22 86 0 126 22-40 22-80 0-126Z" />
            <path d="M240 102c-12 32-12 58 0 84 12-26 12-52 0-84Z" strokeOpacity="0.55" />
          </g>
        ))}
      </g>
      <circle cx="240" cy="240" r="58" fill="#b45f3c" fillOpacity="0.1" stroke="#b45f3c" strokeOpacity="0.28" />
      <circle cx="240" cy="240" r="31" fill="none" stroke="#b08a46" strokeOpacity="0.5" />
      <circle cx="240" cy="240" r="5" fill="#b08a46" />
    </svg>
  );
}

export default async function Home() {
  await connection();
  const locale = await getLocale();
  const supabase = createSupabaseAdminClient();
  const [{ data }, { data: reviews }, hiddenIds] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("reviews").select("*, products(name)").order("rating", { ascending: false }),
    getHiddenProductIds(),
  ]);
  const products = ((data ?? []) as Product[]).filter((product) => !hiddenIds.has(product.id));
  const featuredReviews = ((reviews ?? []) as Review[]).filter(
    (review) => !hiddenIds.has(review.product_id),
  );
  const featured = products.find((product) => product.image_urls?.[0]) ?? products[0];
  const heroImage = featured?.image_urls?.[0];

  return (
    <div>
      <AutoScrollCollection />
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -right-32 top-14 h-[28rem] w-[28rem] rounded-full border border-brass/15" />
          <div className="absolute -left-44 bottom-0 h-80 w-80 rounded-full border border-clay/10" />
          <div className="absolute left-[46%] top-0 h-full w-px bg-line/40" />
        </div>

        <div className="shell relative grid gap-10 py-10 sm:gap-12 sm:py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-20 lg:py-24">
          <div>
            <p className="eyebrow">{t(locale, "heroKicker")}</p>
            <h1 className="display mt-4 max-w-2xl text-[clamp(2.8rem,9vw,6.7rem)] text-ink sm:mt-5">
              {t(locale, "title")}
            </h1>
            <p className="mt-7 max-w-lg text-[1.05rem] leading-8 text-muted">
              {t(locale, "subtitle")}
            </p>
            <p className="mt-4 text-[0.75rem] font-medium uppercase tracking-[0.15em] text-clay-dark">
              {t(locale, "jewelleryJars")}
            </p>

            <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
              <Link href="/#collection" className="btn btn-primary w-full sm:w-auto">
                {t(locale, "heroCta")}
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/#story" className="btn btn-link justify-center sm:justify-start">
                {t(locale, "craftCta")}
              </Link>
            </div>

            <div className="mt-9 grid max-w-lg grid-cols-1 gap-4 border-t border-line pt-6 sm:mt-10 sm:grid-cols-3 sm:gap-5">
              {[t(locale, "handThrown"), t(locale, "smallBatch"), t(locale, "madeInCeylon")].map(
                (label, index) => (
                  <div key={label}>
                    <span className="text-[0.75rem] font-semibold tracking-[0.16em] text-clay-dark">
                      0{index + 1}
                    </span>
                    <p className="mt-1 text-[0.75rem] font-medium uppercase leading-5 tracking-[0.11em] text-ink/75">
                      {label}
                    </p>
                  </div>
                ),
              )}
            </div>
            {featuredReviews[0] && (
              <div className="mt-6 max-w-lg border-l-2 border-clay/60 bg-sand/40 px-4 py-3 sm:mt-8 sm:px-5 sm:py-4">
                <div className="text-xs tracking-[0.28em] text-brass">
                  {"★".repeat(featuredReviews[0].rating)}
                  <span className="text-line">{"★".repeat(5 - featuredReviews[0].rating)}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-[0.95rem] leading-6 text-muted">
                  “{featuredReviews[0].comment}”
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[0.75rem] uppercase tracking-[0.12em] text-ink/70">
                  <span>{featuredReviews[0].name || t(locale, "anonymous")}</span>
                  {featuredReviews[0].products?.name && (
                    <Link href={`/products/${featuredReviews[0].product_id}`} className="text-clay-dark hover:text-ink">
                      {featuredReviews[0].products.name} →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative lg:pl-4">
            <div
              className="absolute -left-5 -top-5 hidden h-24 w-24 border-l border-t border-brass/60 lg:block"
              aria-hidden="true"
            />
            <div className="relative aspect-[4/5] overflow-hidden border border-line bg-sand shadow-[16px_22px_50px_rgba(45,33,27,0.12)] sm:shadow-[24px_32px_70px_rgba(45,33,27,0.13)]">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={featured?.name ?? "Hand-cast one-of-one vessel"}
                  fill
                  priority
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <VesselArt />
              )}
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink/10" />
            </div>

            {featured && (
              <div className="mt-4 border border-line bg-ivory px-4 py-3 sm:px-5 sm:py-4 lg:absolute lg:-bottom-5 lg:right-6 lg:mt-0 lg:w-72 lg:shadow-[0_18px_40px_rgba(45,33,27,0.1)]">
                <p className="eyebrow">{t(locale, "featuredPiece")}</p>
                <Link
                  href={`/products/${featured.id}`}
                  className="mt-1 flex items-center justify-between gap-4 font-display text-xl text-ink transition-colors hover:text-clay-dark sm:text-2xl"
                >
                  {featured.name}
                  <span aria-hidden="true">→</span>
                </Link>
                {(() => {
                  const fp = featured.discount ? featured.price * (1 - featured.discount / 100) : featured.price;
                  return (
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-[0.95rem] font-semibold text-ink">{formatPrice(fp)}</span>
                      {featured.discount > 0 && (
                        <span className="text-[0.85rem] text-muted line-through">{formatPrice(featured.price)}</span>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="absolute -right-3 top-12 hidden items-center gap-3 lg:flex">
              <span className="h-16 w-px bg-brass/60" />
              <span className="[writing-mode:vertical-rl] text-[0.75rem] font-medium uppercase tracking-[0.18em] text-ink/70">
                Ceylon · 06°N 80°E
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="collection" className="shell scroll-mt-24 py-14 sm:py-20 lg:py-24 lg:scroll-mt-28">
        <div className="flex flex-col gap-4 border-b border-line pb-7 sm:gap-5 sm:pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">{t(locale, "collectionKicker")}</p>
            <h2 className="display mt-2 text-3xl text-ink sm:mt-3 sm:text-4xl md:text-5xl">
              {t(locale, "collectionTitle")}
            </h2>
          </div>
          <p className="max-w-sm text-[0.95rem] leading-7 text-muted md:text-right">
            {t(locale, "collectionSubtitle")}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="mt-8 border border-dashed border-line bg-paper px-6 py-16 text-center sm:mt-10 sm:px-8 sm:py-20">
            <p className="font-display text-2xl text-ink sm:text-3xl">{t(locale, "noProducts")}</p>
            <p className="mt-3 text-sm text-muted">{t(locale, "collectionSubtitle")}</p>
          </div>
        ) : (
          <div className="mt-8 sm:mt-10 md:max-h-[48rem] md:overflow-y-auto md:overscroll-contain md:pr-1 md:scroll-area">
          <ul className="grid grid-cols-1 gap-x-4 gap-y-9 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3">
            {products.map((product) => {
              const finalPrice = product.discount
                ? product.price * (1 - product.discount / 100)
                : product.price;
              const image = product.image_urls?.[0];

              return (
                <li key={product.id}>
                  <Link href={`/products/${product.id}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden border border-line bg-sand">
                      {image ? (
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                        />
                      ) : (
                        <VesselArt />
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
                        <span className="bg-ivory/95 px-3 py-1 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ink">
                          {t(locale, "oneOfOne")}
                        </span>
                        {product.premium && (
                          <span className="bg-brass/25 px-3 py-1 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ink">
                            {t(locale, "premium")}
                          </span>
                        )}
                        {product.discount > 0 && (
                          <span className="bg-clay-dark px-3 py-1 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ivory">
                            −{product.discount}%
                          </span>
                        )}
                      </div>

                      <span className="absolute bottom-4 right-4 translate-y-2 bg-ivory/95 px-4 py-2 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        {t(locale, "viewProduct")}
                      </span>
                    </div>

                    <div className="mt-4 flex items-start justify-between gap-4 sm:mt-5 sm:gap-5">
                      <div className="min-w-0">
                        <h3 className="font-display text-xl leading-tight text-ink transition-colors group-hover:text-clay-dark sm:text-2xl">
                          {product.name}
                        </h3>
                        <p className="line-clamp-2-custom mt-1.5 text-[0.9rem] leading-6 text-muted sm:mt-2 sm:text-[0.92rem]">
                          {product.description}
                        </p>
                        <p className="mt-2.5 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted sm:mt-3">
                          {t(locale, "available")} · {product.stock}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[0.95rem] font-semibold text-ink">{formatPrice(finalPrice)}</p>
                        {product.discount > 0 && (
                          <p className="mt-1 text-[0.85rem] text-muted line-through">
                            {formatPrice(product.price)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          </div>
        )}
      </section>

      <section id="story" className="scroll-mt-28 border-y border-line bg-sand/55">
        <div className="shell grid gap-14 py-20 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-20 lg:py-28">
          <div className="relative mx-auto w-full max-w-lg">
            <div className="aspect-square border border-line bg-ivory p-8 shadow-[18px_24px_60px_rgba(45,33,27,0.08)] sm:p-12">
              <CraftMotif />
            </div>
            <div className="absolute -bottom-5 right-0 bg-clay px-6 py-5 text-ivory sm:-right-4">
              <p className="font-display text-3xl leading-none">Ceylon</p>
              <p className="mt-2 text-[0.75rem] font-medium uppercase tracking-[0.15em] text-ivory/80">
                06°N · 80°E
              </p>
            </div>
          </div>

          <div>
            <p className="eyebrow">{t(locale, "storyKicker")}</p>
            <h2 className="display mt-4 max-w-xl text-4xl text-ink sm:text-5xl lg:text-6xl">
              {t(locale, "storyTitle")}
            </h2>
            <p className="mt-6 max-w-xl text-[1.02rem] leading-8 text-muted">
              {t(locale, "storyBody")}
            </p>

            <dl className="mt-9 grid gap-7 border-t border-line pt-7 sm:grid-cols-3">
              {[
                [t(locale, "craftOneTitle"), t(locale, "craftOneBody")],
                [t(locale, "craftTwoTitle"), t(locale, "craftTwoBody")],
                [t(locale, "craftThreeTitle"), t(locale, "craftThreeBody")],
              ].map(([title, body], index) => (
                <div key={title}>
                  <span className="text-[0.75rem] font-semibold tracking-[0.16em] text-clay-dark">0{index + 1}</span>
                  <dt className="mt-2 font-display text-xl text-ink">{title}</dt>
                  <dd className="mt-2 text-[0.9rem] leading-6 text-muted">{body}</dd>
                </div>
              ))}
            </dl>

            <Link href="/#collection" className="btn btn-outline mt-9">
              {t(locale, "heroCta")}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {featuredReviews.length > 0 && (
        <section id="reviews" className="shell scroll-mt-28 py-20 lg:py-24">
        <div className="flex flex-col gap-4 border-b border-line pb-7 sm:gap-5 sm:pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">{t(locale, "reviewsKicker")}</p>
            <h2 className="display mt-2 text-3xl text-ink sm:mt-3 sm:text-4xl md:text-5xl">
                {t(locale, "reviewsTitle")}
              </h2>
            </div>
            <p className="max-w-sm text-[0.95rem] leading-7 text-muted md:text-right">
              {t(locale, "reviewsSubtitle")}
            </p>
          </div>

          <div className="scroll-area mt-10 max-h-[42rem] overflow-y-auto overscroll-contain pr-3">
          <ul className="grid gap-5 md:grid-cols-3">
            {featuredReviews.map((review) => (
              <li
                key={review.id}
                className="flex flex-col border border-line bg-paper p-6 sm:p-7"
              >
                <div className="text-sm tracking-[0.3em] text-brass">
                  {"★".repeat(review.rating)}
                  <span className="text-line">{"★".repeat(5 - review.rating)}</span>
                </div>
                <blockquote className="display mt-5 line-clamp-6 flex-1 text-2xl leading-snug text-ink">
                  “{review.comment}”
                </blockquote>
                <div className="mt-6 border-t border-line pt-4">
                  <p className="text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ink/70">
                    {review.name || t(locale, "anonymous")}
                  </p>
                  {review.products?.name && (
                    <Link
                      href={`/products/${review.product_id}`}
                      className="mt-2 inline-flex text-[0.75rem] font-medium uppercase tracking-[0.11em] text-clay-dark transition-colors hover:text-ink"
                    >
                      {review.products.name} →
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
          </div>
        </section>
      )}
    </div>
  );
}
