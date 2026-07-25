export function requireSharedSecret(
  req: Request,
  headerName = "x-gsvw-ingest-secret",
): void {
  const expected = Deno.env.get("GESTALTVIEW_INGEST_SECRET") ?? "";
  const received = req.headers.get(headerName) ?? "";

  if (!expected) {
    throw new Error("GESTALTVIEW_INGEST_SECRET is not configured.");
  }

  if (received !== expected) {
    throw new Error("Unauthorized: invalid ingestion secret.");
  }
}
