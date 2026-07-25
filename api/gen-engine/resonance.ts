import type { VercelRequest, VercelResponse } from "@vercel/node";

import { scoreResonance } from "../../shared/gen-engine/index.js";
import type { ResonanceRequest } from "../../shared/gen-engine/index.js";
import { sendJson } from "../_lib/response.js";
import { prepareJsonRoute, readBody } from "./_shared.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["POST"])) {
    return;
  }

  const body = readBody<ResonanceRequest>(req);
  const result = scoreResonance(body);
  sendJson(res, 200, {
    ...result,
    diagnostics: {
      route: "/api/gen-engine/resonance",
      provider: "local-resonance-scorer",
      fallbackUsed: false,
    },
  });
}
