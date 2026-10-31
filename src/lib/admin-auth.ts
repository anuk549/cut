import { cookies } from "next/headers";
import crypto from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const COOKIE = "admin_session";
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
export const ADMIN_DB_EMAIL = "adminhed@mati.com";

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean === "adminhed@mati.com" || clean === "adminhead@mati.com";
}

function sessionSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET is not set");
  return s;
}

export function hashAdminPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `${salt}:${derived.toString("hex")}`;
}

export async function getAdminPasswordFromDatabase(email?: string): Promise<string | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const targetEmail = (email || ADMIN_DB_EMAIL).trim().toLowerCase();

    // 1. Check admin_settings table if it exists
    try {
      const { data: settingData } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "admin_password")
        .maybeSingle();
      if (settingData?.value) return String(settingData.value);
    } catch {
      // Table may not exist yet
    }

    // 2. Check admin_users table if it exists
    try {
      const { data: adminUserData } = await supabase
        .from("admin_users")
        .select("password_hash")
        .ilike("email", targetEmail)
        .maybeSingle();
      if (adminUserData?.password_hash) return String(adminUserData.password_hash);
    } catch {
      // Table may not exist yet
    }

    // 3. Check users table for email (e.g. adminhed@mati.com)
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("password_hash")
        .ilike("email", targetEmail)
        .maybeSingle();
      if (userData?.password_hash) return String(userData.password_hash);
    } catch {
      // Table query error
    }

    // 4. If target is an allowed admin email and not found, try alternative or env
    if (isAllowedAdminEmail(targetEmail)) {
      try {
        const altEmail = targetEmail === "adminhed@mati.com" ? "adminhead@mati.com" : "adminhed@mati.com";
        const { data: altData } = await supabase
          .from("users")
          .select("password_hash")
          .ilike("email", altEmail)
          .maybeSingle();
        if (altData?.password_hash) return String(altData.password_hash);
      } catch {}

      const fallbackEnv = process.env.ADMIN_PASSWORD_HASH;
      if (fallbackEnv) {
        try {
          await supabase
            .from("users")
            .upsert(
              { email: ADMIN_DB_EMAIL, password_hash: fallbackEnv },
              { onConflict: "email" },
            );
        } catch {}
        return fallbackEnv;
      }
    }
  } catch (err) {
    console.error("Failed to fetch admin password from DB:", err);
  }
  return null;
}

export async function updateAdminPasswordInDatabase(
  newPassword: string,
  email: string = ADMIN_DB_EMAIL,
): Promise<boolean> {
  const hash = hashAdminPassword(newPassword);
  const targetEmail = email.trim().toLowerCase();
  try {
    const supabase = createSupabaseAdminClient();

    // Update users table for adminhed@mati.com
    const { error: userError } = await supabase.from("users").upsert(
      { email: targetEmail, password_hash: hash },
      { onConflict: "email" },
    );

    // Also update alias if adminhed
    if (targetEmail === "adminhed@mati.com") {
      try {
        await supabase.from("users").upsert(
          { email: "adminhead@mati.com", password_hash: hash },
          { onConflict: "email" },
        );
      } catch {
        // Optional alias
      }
    }

    // Try admin_settings table if it exists
    try {
      await supabase
        .from("admin_settings")
        .upsert({ key: "admin_password", value: hash }, { onConflict: "key" });
    } catch {
      // Optional table
    }

    // Try admin_users table if it exists
    try {
      await supabase
        .from("admin_users")
        .upsert(
          { email: targetEmail, password_hash: hash },
          { onConflict: "email" },
        );
    } catch {
      // Optional table
    }

    return !userError;
  } catch (err) {
    console.error("Failed to update admin password in DB:", err);
    return false;
  }
}

function verifyHash(password: string, stored: string): boolean {
  if (!stored) return false;

  // Plaintext support: if stored directly in DB as plain text, match directly
  if (stored === password) return true;

  // Scrypt hash format (salt:hashHex)
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

export async function verifyPassword(password: string, email?: string): Promise<boolean> {
  const targetEmail = (email || ADMIN_DB_EMAIL).trim().toLowerCase();
  const dbHash = await getAdminPasswordFromDatabase(targetEmail);
  const stored = dbHash || process.env.ADMIN_PASSWORD_HASH || "";

  if (!stored) return false;

  // Check plaintext direct match (e.g. user updated directly in Supabase table editor to plain text)
  if (stored === password) {
    // Automatically upgrade plaintext to secure scrypt hash in the database
    updateAdminPasswordInDatabase(password, targetEmail).catch(() => null);
    return true;
  }

  // Check scrypt hash
  if (verifyHash(password, stored)) {
    return true;
  }

  // Fallback to env hash if DB value differed and failed (only for default admin)
  if (isAllowedAdminEmail(targetEmail)) {
    const envHash = process.env.ADMIN_PASSWORD_HASH;
    if (envHash && stored !== envHash && verifyHash(password, envHash)) {
      return true;
    }
  }

  return false;
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  const sig = crypto.createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  const expected = crypto.createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(COOKIE)?.value);
}

export function adminCookieName(): string {
  return COOKIE;
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}
