// GestaltView v2 — Request Guard Helpers
// © 2026 Keith Soyka / GestaltView
//
// Extracted from the old root-level middleware.ts after Vercel attempted
// to compile it as a Next.js Edge Function. This repo is Vite + Vercel
// serverless, not a Next app, so the request-guard logic now lives here as
// reusable helpers for API routes instead of a framework-specific middleware.

export const BOT_PATTERNS: RegExp[] = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /go-http-client/i,
  /java\/\d/i,
  /libwww/i,
  /zgrab/i,
  /masscan/i,
  /nikto/i,
  /sqlmap/i,
  /nmap/i,
];

export const RATE_LIMITED_PATHS = ['/api/billy', '/api/actions', '/api/diligence'];

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_REQUESTS_PER_SECOND = 5;

const ipWindowMap = new Map<string, { count: number; windowStart: number }>();
const secondWindowMap = new Map<string, { count: number; second: number }>();

export interface RequestGuardHeaders {
  get(name: string): string | null;
}

export interface RequestGuardRequest {
  headers: RequestGuardHeaders;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}

export function getClientIp(request: RequestGuardRequest): string {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

export function isBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent) {
    return true;
  }

  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

export function shouldRateLimitPath(pathname: string): boolean {
  return RATE_LIMITED_PATHS.some((path) => pathname.startsWith(path));
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const currentSecond = Math.floor(now / 1000);

  const secondEntry = secondWindowMap.get(ip);
  if (secondEntry && secondEntry.second === currentSecond) {
    if (secondEntry.count >= MAX_REQUESTS_PER_SECOND) {
      return { allowed: false, remaining: 0, retryAfter: 1 };
    }

    secondEntry.count += 1;
  } else {
    secondWindowMap.set(ip, { count: 1, second: currentSecond });
  }

  const windowEntry = ipWindowMap.get(ip);
  if (!windowEntry || now - windowEntry.windowStart > WINDOW_MS) {
    ipWindowMap.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (windowEntry.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((WINDOW_MS - (now - windowEntry.windowStart)) / 1000),
    };
  }

  windowEntry.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - windowEntry.count,
  };
}
