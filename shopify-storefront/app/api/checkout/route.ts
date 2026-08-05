import { buildCheckout } from "@/lib/checkout.mjs";
import { createSupabaseRepository } from "@/lib/supabase.mjs";

export const runtime = "nodejs";

const unavailable = { error: "Checkout is not available yet." };

export async function POST(request: Request) {
  try {
    const repository = createSupabaseRepository(process.env);
    if (!(await repository.checkRuntimeReadiness())) {
      return Response.json(unavailable, { status: 503 });
    }
  } catch {
    return Response.json(unavailable, { status: 503 });
  }

  try {
    const declaredLength = request.headers.get("content-length");
    if (declaredLength && Number(declaredLength) > 16_384) {
      return Response.json({ error: "The requested offer could not be checked out." }, { status: 413 });
    }
    const input = await request.json();
    return Response.json(buildCheckout(input, process.env), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return Response.json(
      /disabled|configuration/i.test(message)
        ? unavailable
        : { error: "The requested offer could not be checked out." },
      { status: /disabled|configuration/i.test(message) ? 503 : 400 },
    );
  }
}
