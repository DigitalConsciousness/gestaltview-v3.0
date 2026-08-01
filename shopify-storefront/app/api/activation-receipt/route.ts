export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() || "";
  if (!/^[A-Za-z0-9_-]{32,160}$/.test(token)) return Response.json({ error: "invalid_receipt_token" }, { status: 400 });
  const origin = (process.env.GESTALTVIEW_APP_URL || "https://gestaltview-di-gsvw.vercel.app").replace(/\/$/, "");
  try {
    const response = await fetch(`${origin}/api/storefront/activation-receipt?token=${encodeURIComponent(token)}`, { cache: "no-store", headers: { Accept: "application/json" } });
    const payload = await response.json() as { receipt?: { next_action_path?: string | null }; [key: string]: unknown };
    if (payload.receipt?.next_action_path?.startsWith("/")) payload.receipt.next_action_path = `${origin}${payload.receipt.next_action_path}`;
    return Response.json(payload, { status: response.status, headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "receipt_temporarily_unavailable", inputPreserved: true }, { status: 503 });
  }
}
