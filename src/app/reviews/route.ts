import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getHiddenProductIds } from "@/lib/product-visibility";
import { claimReview } from "@/lib/review-ownership";
import { displayNameForEmail, getCurrentUser } from "@/lib/user-auth";
import { sanitizeText } from "@/lib/security/sanitize";
import { getClientKey, isBotSubmission, rateLimit } from "@/lib/security/rate-limit";
import { z } from "zod";

const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to leave feedback." }, { status: 401 });
  }

  const limited = rateLimit(`review:${user.id}:${getClientKey(req)}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many reviews. Please wait a moment." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const input = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;

  if (isBotSubmission(input)) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse({
    productId: input.productId,
    rating: input.rating,
    comment: typeof input.comment === "string" ? sanitizeText(input.comment, 2000) : undefined,
  });
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
