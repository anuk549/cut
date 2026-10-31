import { cookies } from "next/headers";
import crypto from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const COOKIE = "user_session";

function secret(): string {
  return process.env.USER_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET ?? "dev-secret";
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `${salt}:${key.toString("hex")}`;
}

function verifyHash(password: string, stored: string): boolean {
  if (!stored) return false;

  // Plaintext support: if stored directly in Supabase table as plain text
  if (stored === password) return true;

  if (!stored.includes(":")) return false;
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  let derived: Buffer;
  try {
    derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  } catch {
    return false;
  }
  const storedBuf = Buffer.from(hashHex, "hex");
  if (storedBuf.length !== derived.length) return false;
  return crypto.timingSafeEqual(storedBuf, derived);
}

export async function signup(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();
  const cleanEmail = email.trim().toLowerCase();
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .ilike("email", cleanEmail)
    .maybeSingle();

  if (existing) return { ok: false, error: "email exists" };
  const { error } = await supabase
    .from("users")
    .insert({ email: cleanEmail, password_hash: hashPassword(password) });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function login(email: string, password: string): Promise<{ ok: boolean; userId?: string; error?: string }> {
  const supabase = createSupabaseAdminClient();
  const cleanEmail = email.trim().toLowerCase();
  const { data } = await supabase
    .from("users")
    .select("id, email, password_hash")
    .ilike("email", cleanEmail)
    .maybeSingle();

  if (!data) return { ok: false, error: "invalid credentials" };
  if (!verifyHash(password, data.password_hash)) return { ok: false, error: "invalid credentials" };

  // If password was stored as plaintext in DB, automatically upgrade to scrypt hash
  if (data.password_hash === password) {
    try {
      await supabase
        .from("users")
        .update({ password_hash: hashPassword(password) })
        .eq("id", data.id);
    } catch {
      // Background upgrade failure is non-fatal
    }
  }

  return { ok: true, userId: data.id };
}

export function createToken(userId: string): string {
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `${userId}.${expires}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiresStr, sig] = parts;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return null;
  const expected = crypto.createHmac("sha256", secret()).update(`${userId}.${expires}`).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  return userId;
}

export function displayNameForEmail(email: string): string {
  const local = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  if (!local) return "Collector";
  return local.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  const userId = verifyToken(token);
  if (!userId) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("users").select("id, email").eq("id", userId).maybeSingle();
  if (!data) return null;
  return { id: data.id, email: data.email };
}

export function userCookieName() { return COOKIE; }
export function userCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 7 * 24 * 60 * 60 };
}
