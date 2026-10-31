import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getHiddenProductIds } from "@/lib/product-visibility";
import { claimOrder, releaseOrder } from "@/lib/order-ownership";
import { displayNameForEmail, getCurrentUser } from "@/lib/user-auth";
import { sanitizePhone, sanitizeText } from "@/lib/security/sanitize";
import { getClientKey, isBotSubmission, rateLimit } from "@/lib/security/rate-limit";
import { z } from "zod";

const orderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
  customerPhone: z.string().min(7).max(40),
  deliveryNote: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to place an order." }, { status: 401 });
  }

  const limited = rateLimit(`order:${user.id}:${getClientKey(req)}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 });
  }

  const input = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;

  if (isBotSubmission(input)) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const parsed = orderSchema.safeParse({
    productId: input.productId,
    quantity: input.quantity,
    customerPhone: sanitizePhone(input.customerPhone),
    deliveryNote: sanitizeText(input.deliveryNote, 500) || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your phone number and order quantity." },
      { status: 400 },
    );
  }

  const hiddenIds = await getHiddenProductIds();
  if (hiddenIds.has(parsed.data.productId)) {
    return NextResponse.json({ error: "This piece is not available." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("stock")
    .eq("id", parsed.data.productId)
    .maybeSingle();
  if (pErr || !product) return NextResponse.json({ error: "product not found" }, { status: 404 });
  if (product.stock < parsed.data.quantity) {
    return NextResponse.json({ error: "not enough stock" }, { status: 400 });
  }

  const insert: Record<string, unknown> = {
    product_id: parsed.data.productId,
    quantity: parsed.data.quantity,
    customer_name: displayNameForEmail(user.email),
    customer_phone: parsed.data.customerPhone,
  };
  if (parsed.data.deliveryNote) insert.shipping_note = parsed.data.deliveryNote;

  let { data: order, error: oErr } = await supabase
    .from("orders")
    .insert(insert)
    .select()
    .single();
  if (oErr && ((oErr.message ?? "").includes("shipping_note") || (oErr.message ?? "").includes("column"))) {
    const insert2 = { ...insert };
    delete insert2.shipping_note;
    const res2 = await supabase.from("orders").insert(insert2).select().single();
    order = res2.data;
    oErr = res2.error;
  }
  if (oErr || !order) {
    return NextResponse.json({ error: oErr?.message ?? "Could not place order." }, { status: 500 });
  }

  try {
    await claimOrder(user.id, order.id, user.email);
  } catch {
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Could not place order." }, { status: 500 });
  }

  const remaining = product.stock - parsed.data.quantity;
  const { data: updated, error: stockError } = await supabase
    .from("products")
    .update({ stock: remaining })
    .eq("id", parsed.data.productId)
    .eq("stock", product.stock)
    .select("stock")
    .maybeSingle();
  if (stockError || !updated) {
    await supabase.from("orders").delete().eq("id", order.id);
    await releaseOrder(user.id, order.id).catch(() => {});
    return NextResponse.json(
      { error: "Stock changed. Please refresh and try again." },
      { status: 409 },
    );
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    quantity: parsed.data.quantity,
    remaining: updated.stock,
  });
}
