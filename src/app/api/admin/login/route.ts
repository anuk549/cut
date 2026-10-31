import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyPassword, createSessionToken, adminCookieName, adminCookieOptions } from "@/lib/admin-auth";

const attempts = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.reset) {
    attempts.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 5;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "too many attempts" }, { status: 429 });
  }
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (!body.password || !(await verifyPassword(body.password))) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName(), "", { path: "/admin", maxAge: 0 });
  res.cookies.set(adminCookieName(), createSessionToken(), adminCookieOptions());
  return res;
}
