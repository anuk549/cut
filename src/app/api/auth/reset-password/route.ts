import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/user-auth";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";

const resetPasswordSchema = z.object({
  token: z.string().min(20).max(500),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(`reset_password:${getClientKey(req)}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const input = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const parsed = resetPasswordSchema.safeParse({
    token: typeof input.token === "string" ? input.token : "",
    password: typeof input.password === "string" ? input.password : "",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Please choose a password of at least 8 characters." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: parsed.data.token,
    type: "recovery",
  });

  if (error || !data?.user) {
    return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
  }

  const email = (data.user?.email ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Could not reset password." }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({ password_hash: hashPassword(parsed.data.password) })
    .eq("email", email);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
