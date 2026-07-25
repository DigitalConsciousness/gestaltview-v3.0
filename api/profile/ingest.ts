import type { VercelRequest, VercelResponse } from "@vercel/node";

import { runProfileIngestion } from "../_lib/profileIngestion.js";
import { sendJson } from "../_lib/response.js";
import type { ProfileIngestionRequest } from "../../shared/profileIngestion.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = (req.body ?? {}) as ProfileIngestionRequest;
    const result = await runProfileIngestion(body);

    sendJson(res, 200, {
      response: result,
      provider: "internal",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    sendJson(res, 400, {
      error: error instanceof Error ? error.message : "Profile ingestion failed",
      response: {
        runId: null,
        status: "error",
      },
      provider: "internal",
      timestamp: new Date().toISOString(),
    });
  }
}
