import type { VercelRequest, VercelResponse } from "@vercel/node";

import { prepareJsonRoute, readBody } from "../gen-engine/_shared.js";
import { sendJson } from "../_lib/response.js";
import {
  extractOrchestrationSignals,
  type OrchestrationExtractionInput,
} from "../../shared/orchestration/extraction.js";

function validateInput(body: Partial<OrchestrationExtractionInput>): OrchestrationExtractionInput {
  if (!body.trigger) {
    throw new Error("Missing required field: trigger");
  }

  if (!body.sourceRoom) {
    throw new Error("Missing required field: sourceRoom");
  }

  return {
    trigger: body.trigger,
    sourceRoom: body.sourceRoom,
    title: body.title,
    text: body.text,
    contextClues: Array.isArray(body.contextClues) ? body.contextClues : [],
    conversationHistory: Array.isArray(body.conversationHistory) ? body.conversationHistory : [],
    runtimeDailies: Array.isArray(body.runtimeDailies) ? body.runtimeDailies : [],
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["POST"])) {
    return;
  }

  try {
    const body = readBody<Partial<OrchestrationExtractionInput>>(req);
    const input = validateInput(body);
    const extraction = extractOrchestrationSignals(input);

    sendJson(res, 200, {
      extraction,
      diagnostics: {
        route: "/api/orchestrator/extract",
        deterministic: true,
        llmCalled: false,
      },
    });
  } catch (error) {
    sendJson(res, 400, {
      error: error instanceof Error ? error.message : "Invalid orchestration extraction request",
    });
  }
}
