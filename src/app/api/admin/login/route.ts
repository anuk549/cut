import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  verifyPassword,
  createSessionToken,
  adminCookieName,
  adminCookieOptions,
  isAllowedAdminEmail,
  ADMIN_DB_EMAIL,
} from "@/lib/admin-auth";

const attempts = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.reset) {
    attempts.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait 1 minute." },
      { status: 429 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }

  if (!body.password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const email = (body.email || ADMIN_DB_EMAIL).trim().toLowerCase();

  // Enforce that only adminhed@mati.com (or adminhead@mati.com) can access admin
  if (!isAllowedAdminEmail(email)) {
    return NextResponse.json(
      { error: "Access denied. Only adminhed@mati.com has admin studio access." },
      { status: 403 },
    );
  }

  const isValid = await verifyPassword(body.password, email);
  if (!isValid) {
    return NextResponse.json(
      { error: "Incorrect password for adminhed@mati.com. Default is admin123." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName(), "", { path: "/admin", maxAge: 0 });
  res.cookies.set(adminCookieName(), createSessionToken(), adminCookieOptions());
  return res;
}
