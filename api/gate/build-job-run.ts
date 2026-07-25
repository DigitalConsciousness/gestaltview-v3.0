import type { VercelRequest, VercelResponse } from "@vercel/node";

import { delegateGateRequest, extractGateRouteParam } from "./_delegate.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const buildJobId = extractGateRouteParam(req.query.id, "id");
  return delegateGateRequest(req, res, ["build-jobs", buildJobId, "run"]);
}
