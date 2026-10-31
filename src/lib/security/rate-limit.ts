type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * In-memory sliding-window rate limiter with automatic pruning.
 */
export function rateLimit(key: string, limit = 10, windowMs = 60000) {
  const now = Date.now();

  // Periodic pruning of expired buckets to prevent memory leaks in production
  if (buckets.size > 1500) {
    for (const [k, v] of buckets.entries()) {
      if (now > v.resetAt) {
        buckets.delete(k);
      }
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

/**
 * Clear a rate-limit bucket (e.g. after a successful login).
 */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}

/**
 * Extract true client IP in production across Vercel, Cloudflare, and reverse proxies.
 */
export function getClientKey(req: Request) {
  const headers = req.headers;
  const ip =
    headers.get("cf-connecting-ip")?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1";
  return ip;
}

/**
 * Honeypot bot detector.
 * Checks if automated form-filling bots filled invisible honeypot fields.
 */
export function isBotSubmission(body: Record<string, unknown>): boolean {
  // Common honeypot field names
  const honeypotKeys = ["hp_field", "website_url", "company_fax", "bot_check"];
  for (const key of honeypotKeys) {
    const value = body[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return true;
    }
  }
  return false;
}
