import type { VercelRequest, VercelResponse } from "@vercel/node";

export interface CorsOptions {
  methods?: string[];
  allowHeaders?: string[];
  defaultOrigin?: string;
  vary?: string[];
}

const DEFAULT_METHODS = ["POST", "OPTIONS"];
const DEFAULT_ALLOW_HEADERS = ["Content-Type"];
const DEFAULT_VARY = ["Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"];

function parseConfiguredOrigins(): string[] {
  return (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => (origin === "*" ? origin : normalizeOrigin(origin)))
    .filter((origin): origin is string => origin !== null);
}

function normalizeOrigin(value: string): string | null {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

export function resolveRequestOrigin(req: VercelRequest): string | null {
  const headerOrigin = typeof req.headers.origin === "string" ? req.headers.origin.trim() : "";
  if (!headerOrigin) return null;
  return normalizeOrigin(headerOrigin);
}

export function resolveCorsOrigin(req: VercelRequest, defaultOrigin = "*"): string {
  const configuredOrigins = parseConfiguredOrigins();
  const requestOrigin = resolveRequestOrigin(req);

  if (configuredOrigins.length === 0) {
    return defaultOrigin;
  }

  if (configuredOrigins.includes("*")) {
    return requestOrigin ?? "*";
  }

  if (requestOrigin && configuredOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return configuredOrigins[0];
}

function mergeVary(existing: string | number | readonly string[] | undefined, values: string[]): string {
  const existingTokens = Array.isArray(existing)
    ? existing.flatMap((entry) => String(entry).split(","))
    : String(existing ?? "").split(",");

  const merged = [...existingTokens, ...values]
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token, index, all) => all.indexOf(token) === index);

  return merged.join(", ");
}

export function applyCorsHeaders(req: VercelRequest, res: VercelResponse, options: CorsOptions = {}): void {
  const methods = options.methods?.length ? options.methods : DEFAULT_METHODS;
  const allowHeaders = options.allowHeaders?.length ? options.allowHeaders : DEFAULT_ALLOW_HEADERS;
  const vary = options.vary?.length ? options.vary : DEFAULT_VARY;
  const existingVary = typeof (res as { getHeader?: (name: string) => unknown }).getHeader === "function"
    ? (res as { getHeader: (name: string) => unknown }).getHeader("Vary")
    : undefined;

  res.setHeader("Access-Control-Allow-Origin", resolveCorsOrigin(req, options.defaultOrigin ?? "*"));
  res.setHeader("Access-Control-Allow-Methods", methods.join(", "));
  res.setHeader("Access-Control-Allow-Headers", allowHeaders.join(", "));
  res.setHeader("Vary", mergeVary(existingVary as string | number | readonly string[] | undefined, vary));
}
