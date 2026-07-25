import type { VercelRequest, VercelResponse } from "@vercel/node";

import { scanAmbientCoherence } from "../../shared/gen-engine/index.js";
import type { AmbientScanRequest } from "../../shared/gen-engine/index.js";
import { sendJson } from "../_lib/response.js";
import { prepareJsonRoute, readBody } from "./_shared.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["POST"])) {
    return;
  }

  const body = readBody<AmbientScanRequest>(req);
  sendJson(res, 200, scanAmbientCoherence(body));
}
