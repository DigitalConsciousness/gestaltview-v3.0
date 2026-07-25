import { runCouncil } from "../../server/council/councilRunner.js";
import { withSentryFetchHandler } from "../_lib/sentry.js";

async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
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
      return new Response(JSON.stringify({ error: "userPrompt and slugs are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const corpusContext = Array.isArray(payload.corpusContext)
      ? payload.corpusContext.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      : [];

    const result = await runCouncil(userPrompt, slugs, corpusContext);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[council/run] error", error);
    return new Response(JSON.stringify({ error: "Council runner unavailable right now." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export default withSentryFetchHandler(handler, "/api/council/run");
