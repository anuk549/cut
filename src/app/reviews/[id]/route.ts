import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getOwnedReviewIds, releaseReview } from "@/lib/review-ownership";
import { getCurrentUser } from "@/lib/user-auth";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to delete feedback." }, { status: 401 });
  }

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "invalid feedback" }, { status: 400 });
  }

  const owned = await getOwnedReviewIds(user.id);
  if (!owned.has(id)) {
    return NextResponse.json({ error: "You can only delete your own feedback." }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "feedback not found" }, { status: 404 });
  }

  await releaseReview(user.id, id).catch(() => {});
  return NextResponse.json({ ok: true });
}
