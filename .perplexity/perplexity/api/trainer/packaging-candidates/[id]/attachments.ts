import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../../_lib/response.js";
import {
  extractRouteParam,
  handleTrainerOptions,
  requireTrainerGovernanceAdmin,
} from "../../_helpers.js";
import { uploadTrainerPackagingCandidateAttachment } from "../../../../server/trainer/experiment-repository.js";
import { UploadTrainerPackagingAttachmentRequestSchema } from "../../../../shared/agent-trainer/schemas.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTrainerOptions(req, res, ["POST"])) {
    return;
  }

  const admin = await requireTrainerGovernanceAdmin(req, res);
  if (!admin) {
    return;
  }

  try {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    const candidateId = extractRouteParam(req.query.id, "id");
    const input = UploadTrainerPackagingAttachmentRequestSchema.parse(req.body ?? {});
    const candidate = await uploadTrainerPackagingCandidateAttachment(
      candidateId,
      input,
      admin.email || "Keith"
    );

    sendJson(res, 200, { candidate });
  } catch (error) {
    sendJson(res, 500, {
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload packaging attachment.",
    });
  }
}
