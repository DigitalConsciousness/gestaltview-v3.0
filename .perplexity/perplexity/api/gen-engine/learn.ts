import type { VercelRequest, VercelResponse } from "@vercel/node";

import { buildLearnResponse } from "../../shared/gen-engine/index.js";
import type { LearnRequest } from "../../shared/gen-engine/index.js";
import { sendJson } from "../_lib/response.js";
import { prepareJsonRoute, readBody } from "./_shared.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["POST"])) {
    return;
  }

  const body = readBody<LearnRequest>(req);
  sendJson(res, 200, buildLearnResponse(body));
}
