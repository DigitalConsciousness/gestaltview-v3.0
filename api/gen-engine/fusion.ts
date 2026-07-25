import type { VercelRequest, VercelResponse } from "@vercel/node";

import { createCaptureSignal, normalizeConsent } from "../../shared/gen-engine/index.js";
import type { FusionRequest } from "../../shared/gen-engine/index.js";
import { sendJson } from "../_lib/response.js";
import { prepareJsonRoute, readBody } from "./_shared.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["POST"])) {
    return;
  }

  const body = readBody<Partial<FusionRequest>>(req);
  const result = createCaptureSignal({
    captureId: body.captureId,
    text: body.text,
    imageUrl: body.imageUrl,
    imageBase64: body.imageBase64,
    audioUrl: body.audioUrl,
    videoUrl: body.videoUrl,
    fileUrl: body.fileUrl,
    fileName: body.fileName,
    sourceRoom: typeof body.sourceRoom === "string" ? body.sourceRoom : "import",
    consent: normalizeConsent(body.consent),
    userId: body.userId,
    context: body.context,
  });

  sendJson(res, 200, result);
}
