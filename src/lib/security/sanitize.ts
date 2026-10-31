export function sanitizeText(input: unknown, maxLen = 1000): string {
  if (typeof input !== "string") return "";
  const cleaned = input.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
  return cleaned.slice(0, maxLen);
}

export function sanitizeEmail(input: unknown): string {
  const s = sanitizeText(input, 320).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : "";
}

export function sanitizePhone(input: unknown): string {
  const s = sanitizeText(input, 20).replace(/[^+\d\s()-]/g, "");
  return s.length >= 7 ? s : "";
}

export function sanitizeName(input: unknown): string {
  return sanitizeText(input, 80).replace(/[^a-zA-Z\s.'-]/g, " ").replace(/\s+/g, " ").trim();
}
