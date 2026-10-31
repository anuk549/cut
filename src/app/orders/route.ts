import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getHiddenProductIds } from "@/lib/product-visibility";
import { getCurrentUser } from "@/lib/user-auth";
import { z } from "zod";

export async function POST(req: NextRequest) {
  let body: { productId?: string; quantity?: number; customerName?: string; customerPhone?: string; deliveryNote?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const schema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    customerName: z.string().max(120).optional(),
    customerPhone: z.string().max(40).optional(),
    deliveryNote: z.string().max(200).optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid order" }, { status: 400 });
  }
  const hiddenIds = await getHiddenProductIds();
  if (hiddenIds.has(parsed.data.productId)) {
    return NextResponse.json({ error: "This piece is not available." }, { status: 400 });
  }

  const [user] = await Promise.all([getCurrentUser().catch(() => null)]);
  const supabase = createSupabaseAdminClient();
  const { data: product, error: pErr } = await supabase.from("products").select("stock").eq("id", parsed.data.productId).maybeSingle();
  if (pErr || !product) return NextResponse.json({ error: "product not found" }, { status: 404 });
  if (product.stock < parsed.data.quantity) return NextResponse.json({ error: "not enough stock" }, { status: 400 });

  const insert: Record<string, unknown> = {
    product_id: parsed.data.productId,
    quantity: parsed.data.quantity,
    customer_name: parsed.data.customerName ?? "",
    customer_phone: parsed.data.customerPhone ?? "",
  };
  if ((parsed.data as any).deliveryNote) {
    try {
      (insert as any).shipping_note = (parsed.data as any).deliveryNote;
    } catch {}
  }
  let { data: order, error: oErr } = await supabase
    .from("orders")
    .insert(insert)
    .select()
    .single();
  if (oErr && ((oErr.message ?? "").includes("shipping_note") || (oErr.message ?? "").includes("column"))) {
    const insert2 = { ...insert } as any;
    delete insert2.shipping_note;
    const res2 = await supabase.from("orders").insert(insert2).select().single();
    order = res2.data;
    oErr = res2.error;
  }
  if (oErr) return NextResponse.json({ error: oErr.message }, { status: 500 });

  const remaining = product.stock - parsed.data.quantity;
  await supabase.from("products").update({ stock: remaining }).eq("id", parsed.data.productId);

  return NextResponse.json({ ok: true, orderId: order.id, quantity: parsed.data.quantity, remaining });
}
