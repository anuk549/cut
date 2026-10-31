import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { signup, createToken, userCookieName, userCookieOptions } from "@/lib/user-auth";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; fullName?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid" }, { status: 400 }); }
  if (!body.email || !body.password || body.password.length < 6) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }
  const res = await signup(body.email, body.password);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  // get user id
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("users").select("id").eq("email", body.email).single();
  if (data?.id && body.fullName) {
    await supabase.from("users").update({ full_name: body.fullName }).eq("id", data.id);
  }
  const r = NextResponse.json({ ok: true });
  r.cookies.set(userCookieName(), createToken(data!.id), userCookieOptions());
  return r;
}
