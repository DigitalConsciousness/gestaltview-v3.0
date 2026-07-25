export type CorsOptions = {
  methods?: string[];
  allowCredentials?: boolean;
};

function normalizeOrigin(value: string | null): string {
  if (!value) return "";
  return value.trim().replace(/\/+$/, "");
}

function allowedOrigins(): string[] {
  const raw = Deno.env.get("CORS_ORIGINS") ?? "";
  const parsed = raw
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

  const defaults = [
    "https://gestaltview-di-gsvw.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
  ];

  return Array.from(new Set([...parsed, ...defaults]));
}

export function buildCorsHeaders(
  req: Request,
  options: CorsOptions = {},
): HeadersInit {
  const requestOrigin = normalizeOrigin(req.headers.get("origin"));
  const allowed = allowedOrigins();
  const matchedOrigin =
    requestOrigin && allowed.includes(requestOrigin)
      ? requestOrigin
      : (allowed[0] ?? "*");

  const methods = options.methods ?? [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ];
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": matchedOrigin,
    "Access-Control-Allow-Methods": methods.join(", "),
    "Access-Control-Allow-Headers": [
      "authorization",
      "x-client-info",
      "apikey",
      "content-type",
      "x-gsvw-ingest-secret",
      "x-gsvw-operator-secret",
    ].join(", "),
    Vary: "Origin",
  };

  if (options.allowCredentials) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: buildCorsHeaders(req) });
  }
  return null;
}
