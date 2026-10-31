import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { login, createToken, userCookieName, userCookieOptions } from "@/lib/user-auth";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid" }, { status: 400 }); }
  if (!body.email || !body.password) return NextResponse.json({ error: "invalid input" }, { status: 400 });
  const res = await login(body.email, body.password);
  if (!res.ok || !res.userId) return NextResponse.json({ error: res.error }, { status: 401 });
  const r = NextResponse.json({ ok: true });
  r.cookies.set(userCookieName(), createToken(res.userId), userCookieOptions());
  return r;
}
