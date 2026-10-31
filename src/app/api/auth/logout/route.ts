import { NextResponse } from "next/server";
import { userCookieName } from "@/lib/user-auth";

export async function POST() {
  const r = NextResponse.json({ ok: true });
  r.cookies.set(userCookieName(), "", { path: "/", maxAge: 0 });
  return r;
}
