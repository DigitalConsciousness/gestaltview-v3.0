import { issueClaim, redeemClaim } from "@/lib/claim.mjs";
import { createSupabaseRepository } from "@/lib/supabase.mjs";

export const runtime = "nodejs";

const NOT_FOUND = {
  error: "We could not verify that claim. Check the details or contact GestaltView.",
};

export async function POST(request: Request) {
  try {
    const declaredLength = request.headers.get("content-length");
    if (declaredLength && Number(declaredLength) > 4096) {
      return Response.json(NOT_FOUND, { status: 413 });
    }
    const input = (await request.json()) as { token?: unknown; order?: unknown; email?: unknown };
    const repository = createSupabaseRepository(process.env);
    const pepper = process.env.STOREFRONT_CLAIM_TOKEN_PEPPER;
    if (typeof input.token === "string") {
      const receipt = await redeemClaim({ token: input.token, pepper, repository });
      return receipt
        ? Response.json({ receipt }, { headers: { "Cache-Control": "no-store" } })
        : Response.json(NOT_FOUND, { status: 404 });
    }
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const result = await issueClaim({
      orderName: input.order,
      email: input.email,
      rateLimitKey: forwarded,
      pepper,
      origin: process.env.STOREFRONT_ORIGIN,
      repository,
    });
    return result
      ? Response.json(result, { headers: { "Cache-Control": "no-store" } })
      : Response.json(NOT_FOUND, { status: 404 });
  } catch {
    return Response.json(
      { error: "Claim service is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
