import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getHiddenProductIds } from "@/lib/product-visibility";
import { claimReview } from "@/lib/review-ownership";
import { displayNameForEmail, getCurrentUser } from "@/lib/user-auth";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to leave feedback." }, { status: 401 });
  }

  let body: { productId?: string; rating?: number; comment?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const schema = z.object({
    productId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(2000).optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid review" }, { status: 400 });
  }

  const hiddenIds = await getHiddenProductIds();
  if (hiddenIds.has(parsed.data.productId)) {
    return NextResponse.json({ error: "This piece is not available." }, { status: 404 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      product_id: parsed.data.productId,
      name: displayNameForEmail(user.email),
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? "",
    })
    .select("id")
    .single();
  if (error || !review) {
    return NextResponse.json({ error: error?.message ?? "Could not save feedback." }, { status: 500 });
  }

  try {
    await claimReview(user.id, review.id);
  } catch {
    await supabase.from("reviews").delete().eq("id", review.id);
    return NextResponse.json({ error: "Could not save feedback." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
