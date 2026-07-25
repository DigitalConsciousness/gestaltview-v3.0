import { runCouncil } from "../../server/council/councilRunner.js";
import { getAuthUser } from "../_lib/auth.js";
import { withSentryFetchHandler } from "../_lib/sentry.js";
import {
  buildEntitlementBlock,
  canUseAdvancedTribunal,
  isAdvancedTribunalRequest,
} from "../../shared/entitlements.js";

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isTribunalBetaEnabled(): boolean {
  return (process.env.TRIBUNAL_BETA_ALL_VOICES_ENABLED ?? "").trim().toLowerCase() === "true";
}

async function getFetchAuthUser(req: Request) {
  return getAuthUser({
    headers: {
      authorization: req.headers.get("authorization") ?? undefined,
      cookie: req.headers.get("cookie") ?? undefined,
    },
    url: req.url,
  } as never);
}

async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const payload = (await req.json()) as {
      userPrompt?: string;
      slugs?: string[];
      corpusContext?: string[];
    };

    const userPrompt = payload.userPrompt?.trim();
    const slugs = Array.isArray(payload.slugs)
      ? payload.slugs.filter((slug): slug is string => typeof slug === "string" && Boolean(slug.trim()))
      : [];

    if (!userPrompt || slugs.length === 0) {
      return jsonResponse({ error: "userPrompt and slugs are required." }, 400);
    }

    const corpusContext = Array.isArray(payload.corpusContext)
      ? payload.corpusContext.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      : [];

    const authUser = await getFetchAuthUser(req);
    if (
      isAdvancedTribunalRequest({ participants: slugs }) &&
      !canUseAdvancedTribunal({
        tier: authUser?.tier,
        betaEnabled: isTribunalBetaEnabled(),
      })
    ) {
      return jsonResponse(buildEntitlementBlock("advanced_tribunal"), 403);
    }

    const result = await runCouncil(userPrompt, slugs, corpusContext);

    return jsonResponse(result as unknown as Record<string, unknown>, 200);
  } catch (error) {
    console.error("[council/run] error", error);
    return jsonResponse({ error: "Council runner unavailable right now." }, 500);
  }
}

export default withSentryFetchHandler(handler, "/api/council/run");
