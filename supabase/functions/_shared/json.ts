import { buildCorsHeaders } from "./cors.ts";

export function jsonResponse(
  req: Request,
  body: unknown,
  init: ResponseInit = {},
): Response {
  const headers = new Headers(init.headers);
  const cors = buildCorsHeaders(req);
  Object.entries(cors).forEach(([key, value]) =>
    headers.set(key, String(value)),
  );
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body, null, 2), { ...init, headers });
}

export function errorResponse(
  req: Request,
  status: number,
  message: string,
  details?: unknown,
): Response {
  return jsonResponse(
    req,
    { ok: false, error: message, details: details ?? null },
    { status },
  );
}

export async function readJson<T>(req: Request): Promise<T> {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Expected application/json request body.");
  }
  return (await req.json()) as T;
}
