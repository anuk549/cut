import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Probing & Exploit Pattern Blocklist (Path Traversal, Config Probes, Scanners)
const BLOCKED_PATH_PATTERNS = [
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/\.aws/i,
  /\.(php|asp|aspx|jsp|cgi|pl|sh|bash|sql|tar|gz|bak|old|swp)$/i,
  /^\/(wp-admin|wp-login|xmlrpc|phpmyadmin|pma|adminer|cgi-bin)/i,
  /\/(eval-stdin|setup\.cgi|shell\.php)/i,
];

// 2. Malicious Scanning Tools & Exploit Bots
const MALICIOUS_BOT_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /acunetix/i,
  /wpscan/i,
  /dirbuster/i,
  /gobuster/i,
  /masscan/i,
  /nmap/i,
  /zgrab/i,
  /nuclei/i,
  /havij/i,
  /headless/i,
  /phantomjs/i,
  /selenium/i,
  /playwright/i,
  /puppeteer/i,
  /python-requests/i,
  /scrapy/i,
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent") || "";

  // A. Block Automated Scanners & Vulnerability Probes immediately
  for (const pattern of BLOCKED_PATH_PATTERNS) {
    if (pattern.test(pathname)) {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  // B. Block Known Exploit Bots by User-Agent
  for (const botPattern of MALICIOUS_BOT_AGENTS) {
    if (botPattern.test(userAgent)) {
      return new NextResponse("Access Denied", { status: 403 });
    }
  }

  // C. Disallow risky HTTP methods
  const method = request.method.toUpperCase();
  if (method === "TRACE" || method === "TRACK") {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  // D. CSRF Protection for state-changing API requests
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && pathname.startsWith("/api/")) {
    const secFetchSite = request.headers.get("sec-fetch-site");
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    const sameSiteByFetch = !secFetchSite || secFetchSite === "same-origin";
    let sameSiteByOrigin = true;
    if (origin && host) {
      const originHost = origin.replace(/^https?:\/\//, "").trim().toLowerCase();
      const hostHost = host.trim().toLowerCase();
      sameSiteByOrigin = originHost === hostHost;
    }

    if (!sameSiteByFetch || !sameSiteByOrigin) {
      return NextResponse.json({ error: "Forbidden: cross-origin mutation denied" }, { status: 403 });
    }
  }

  // E. Route Protection for Studio Admin Area
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const adminSession = request.cookies.get("admin_session")?.value;
    if (!adminSession) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/api/admin/") && pathname !== "/api/admin/login") {
    const adminSession = request.cookies.get("admin_session")?.value;
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // F. Apply Production Security Headers
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "0");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.vercel-insights.com https://vitals.vercel-insights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
