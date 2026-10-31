import { connection } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getHiddenProductIds } from "@/lib/product-visibility";
import ProductForm from "../product-form";
import ProductActions from "../product-actions";
import VisibilityToggle from "../visibility-toggle";
import VesselArt from "@/components/vessel-art";
import Image from "next/image";
import type { AdminProduct } from "../types";

export const instant = false;

const priceFormatter = new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 });
function formatPrice(v: number) { return priceFormatter.format(v).replace("LKR", "Rs."); }
function finalPrice(p: AdminProduct) { return Math.round(p.price * (1 - p.discount / 100)); }

export default async function AdminProductsListPage() {
  await connection();
  const supabase = createSupabaseAdminClient();
  const [{ data }, hiddenIds] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    getHiddenProductIds(),
  ]);
  const products = (data ?? []).map((p) => ({ ...(p as Omit<AdminProduct, "hidden">), hidden: hiddenIds.has(p.id) }));
  return (
    <div className="space-y-6">
      <ProductForm locale="en" />
      <section className="border border-line bg-ivory">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="eyebrow">Inventory</p>
            <h2 className="font-display text-2xl text-ink">Products</h2>
          </div>
          <p className="text-[0.75rem] uppercase tracking-[0.12em] text-muted">{products.length} pieces</p>
        </div>
        <ul className="divide-y divide-line">
          {products.map((product) => {
            const price = finalPrice(product);
            const image = product.image_urls?.[0];
            return (
              <li key={product.id} className="grid gap-4 p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center sm:gap-6 sm:p-5">
                <div className="relative h-24 w-24 overflow-hidden border border-line bg-sand">
                  {image ? <Image src={image} alt={product.name} fill sizes="96px" className="object-cover" /> : <VesselArt />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-xl text-ink">{product.name}</p>
                    {product.premium && <span className="bg-brass/20 px-2 py-0.5 text-[0.7rem] uppercase tracking-[0.12em]">Premium</span>}
                    {product.hidden && <span className="bg-clay/10 px-2 py-0.5 text-[0.7rem] uppercase tracking-[0.12em] text-clay-dark">Hidden</span>}
                  </div>
                  <p className="mt-1 text-[0.9rem] text-muted">Stock: {product.stock} · {formatPrice(price)}{product.discount>0 && <span className="ml-2 text-muted line-through">{formatPrice(product.price)}</span>}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <VisibilityToggle productId={product.id} productName={product.name} hidden={product.hidden} />
                  </div>
                </div>
                <ProductActions product={product} locale="en" />
              </li>
            );
          })}
          {products.length === 0 && <li className="p-5 text-[0.95rem] text-muted">No products yet.</li>}
        </ul>
      </section>
    </div>
  );
}
