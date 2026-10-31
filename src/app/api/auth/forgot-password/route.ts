import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sanitizeEmail } from "@/lib/security/sanitize";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";

const forgotPasswordSchema = z.object({
  email: z.string().email().max(320),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(`forgot_password:${getClientKey(req)}`, 3, 60_000);
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
  const parsed = forgotPasswordSchema.safeParse({ email: sanitizeEmail(input.email) });
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).trim().replace(/\/+$/, "");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: parsed.data.email,
    options: { redirectTo: `${siteUrl}/reset-password` },
  });

  if (error || !data?.properties?.action_link) {
    // Do not reveal whether the account exists
    return NextResponse.json({ ok: true });
  }

  const actionLink = data.properties.action_link;
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MATI <onboarding@resend.dev>",
        to: parsed.data.email,
        subject: "Reset your MATI password",
        html: `<p>Hi, we received a request to reset your MATI password.</p><p><a href="${actionLink}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
        text: `Reset your MATI password: ${actionLink}`,
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to send reset email." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
