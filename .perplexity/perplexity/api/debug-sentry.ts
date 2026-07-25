import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as Sentry from "@sentry/node";
import { withSentryVercelHandler } from "./_lib/sentry.js";

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).setHeader("Allow", "GET").json({ error: "Method not allowed" });
    return;
  }

  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.SENTRY_DEBUG_ENDPOINT_ENABLED !== "true"
  ) {
    res.status(404).end();
    return;
  }

  Sentry.logger.info("User triggered test error", {
    action: "test_error_endpoint",
    runtime: "vercel-api",
  });
  Sentry.metrics.count("test_counter", 1);

  throw new Error("My first Sentry error!");
}

export default withSentryVercelHandler(handler, "/api/debug-sentry", {
  runtime: "vercel-api-debug",
});
