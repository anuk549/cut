import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { login, createToken, userCookieName, userCookieOptions } from "@/lib/user-auth";
import {
  isAllowedAdminEmail,
  createSessionToken,
  adminCookieName,
  adminCookieOptions,
} from "@/lib/admin-auth";
import { sanitizeEmail } from "@/lib/security/sanitize";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(`login:${getClientKey(req)}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const input = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;

  // Allow entering full email ("adminhed@mati.com") OR username ("adminhed")
  let rawEmail = typeof input.email === "string" ? input.email.trim() : "";
  if (rawEmail && !rawEmail.includes("@")) {
    rawEmail = `${rawEmail}@mati.com`;
  }

  const cleanEmail = sanitizeEmail(rawEmail);
  const password = typeof input.password === "string" ? input.password : "";

  const parsed = loginSchema.safeParse({
    email: cleanEmail,
    password,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter a valid email and password." },
      { status: 400 },
    );
  }

  const res = await login(parsed.data.email, parsed.data.password);
  if (!res.ok || !res.userId) {
    return NextResponse.json(
      { error: "Invalid email or password. Please verify your credentials." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true, email: parsed.data.email });
  response.cookies.set(userCookieName(), createToken(res.userId), userCookieOptions());

  // If this user is an authorized admin (adminhed@mati.com), also issue admin session
  if (isAllowedAdminEmail(parsed.data.email)) {
    response.cookies.set(adminCookieName(), createSessionToken(), adminCookieOptions());
  }

  return response;
}
