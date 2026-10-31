import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { login, createToken, userCookieName, userCookieOptions } from "@/lib/user-auth";
import { sanitizeEmail } from "@/lib/security/sanitize";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(`login:${getClientKey(req)}`, 10, 60_000);
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
  const parsed = loginSchema.safeParse({
    email: sanitizeEmail(input.email),
    password: typeof input.password === "string" ? input.password : "",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const res = await login(parsed.data.email, parsed.data.password);
  if (!res.ok || !res.userId) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(userCookieName(), createToken(res.userId), userCookieOptions());
  return response;
}
