import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { signup, createToken, userCookieName, userCookieOptions } from "@/lib/user-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sanitizeEmail, sanitizeName } from "@/lib/security/sanitize";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(6).max(200),
  fullName: z.string().min(1).max(80),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(`signup:${getClientKey(req)}`, 5, 60_000);
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
  const parsed = signupSchema.safeParse({
    email: sanitizeEmail(input.email),
    password: typeof input.password === "string" ? input.password : "",
    fullName: sanitizeName(input.fullName),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid name, email and a password with at least 6 characters." },
      { status: 400 },
    );
  }

  const res = await signup(parsed.data.email, parsed.data.password);
  if (!res.ok) {
    return NextResponse.json({ error: res.error ?? "Could not create account." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();
  if (!user?.id) {
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }

  await supabase.from("users").update({ full_name: parsed.data.fullName }).eq("id", user.id);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(userCookieName(), createToken(user.id), userCookieOptions());
  return response;
}
