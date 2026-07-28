export const config = {
  api: {
    bodyParser: false,
  },
};

import type { VercelRequest, VercelResponse } from "@vercel/node";

import { delegateGateRequest } from "./_delegate.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  return delegateGateRequest(req, res, ["webhooks", "stripe"]);
}
