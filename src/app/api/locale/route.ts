import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales } from "@/i18n/messages";

export async function POST(req: NextRequest) {
  const { locale } = await req.json();
  if (!locales.includes(locale)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}
