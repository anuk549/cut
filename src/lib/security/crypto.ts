import crypto from "crypto";

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || process.env.ADMIN_SESSION_SECRET || process.env.USER_SESSION_SECRET;
  if (!key) {
    throw new Error("Missing ENCRYPTION_KEY/SESSION_SECRET");
  }
  return crypto.createHash("sha256").update(key).digest();
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decrypt(payload: string): string {
  const data = Buffer.from(payload, "base64url");
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

export function encryptJson(value: unknown): string {
  return encrypt(JSON.stringify(value));
}

export function decryptJson<T = unknown>(payload: string): T | null {
  try {
    return JSON.parse(decrypt(payload)) as T;
  } catch {
    return null;
  }
}

export function hashToken(token: string): string {
  return crypto.createHmac("sha256", getKey()).update(token).digest("hex");
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}
