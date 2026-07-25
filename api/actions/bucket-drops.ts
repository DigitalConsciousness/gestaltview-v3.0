import type { VercelRequest, VercelResponse } from "@vercel/node";
import handleActionsRequest from "../_lib/actionsHandler.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handleActionsRequest(req, res, "bucket-drops");
}
