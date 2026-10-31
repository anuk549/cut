import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  verifyPassword,
  createSessionToken,
  adminCookieName,
  adminCookieOptions,
  isAllowedAdminEmail,
  ADMIN_DB_EMAIL,
} from "@/lib/admin-auth";
import { getClientKey, rateLimit, resetRateLimit } from "@/lib/security/rate-limit";

const adminLoginSchema = z.object({
  email: z.string().email().max(320).optional(),
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  const ip = getClientKey(req);
  const key = `admin_login:${ip}`;
  const limited = rateLimit(key, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute before trying again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }

  const input = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const parsed = adminLoginSchema.safeParse({
    email: typeof input.email === "string" ? input.email : ADMIN_DB_EMAIL,
    password: typeof input.password === "string" ? input.password : "",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email and password." }, { status: 400 });
  }

  const email = parsed.data.email!.trim().toLowerCase();

  // Enforce that only adminhed@mati.com (or adminhead@mati.com) can access admin
  if (!isAllowedAdminEmail(email)) {
    return NextResponse.json(
      { error: "Access denied. Admin studio access is restricted." },
      { status: 403 },
    );
  }

  const isValid = await verifyPassword(parsed.data.password, email);
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  resetRateLimit(key);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName(), createSessionToken(), adminCookieOptions());
  return res;
}
