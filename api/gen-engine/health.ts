import type { VercelRequest, VercelResponse } from "@vercel/node";

import { buildGenEngineHealth } from "../../shared/gen-engine/index.js";
import { sendJson } from "../_lib/response.js";
import { prepareJsonRoute } from "./_shared.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["GET"])) {
    return;
  }

  sendJson(res, 200, buildGenEngineHealth(process.env));
}
