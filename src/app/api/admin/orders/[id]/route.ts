import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "invalid order" }, { status: 400 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const schema = z.object({
    status: z.enum(["pending", "confirmed", "shipping", "arrived", "cancelled"]),
    shipping_note: z.string().max(200).optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  let { error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status, shipping_note: parsed.data.shipping_note ?? null })
    .eq("id", id);

  if (error && ((error.message ?? "").includes("shipping_note") || (error.message ?? "").includes("column"))) {
    const fallback = await supabase
      .from("orders")
      .update({ status: parsed.data.status })
      .eq("id", id);
    error = fallback.error;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
