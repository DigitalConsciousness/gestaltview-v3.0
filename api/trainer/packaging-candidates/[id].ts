import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../_lib/response.js";
import {
  extractRouteParam,
  handleTrainerOptions,
  requireTrainerGovernanceAdmin,
} from "../_helpers.js";
import {
  evaluateTrainerPackagingGate,
  getTrainerPackagingCandidate,
  updateTrainerPackagingCandidate,
} from "../../../server/trainer/experiment-repository.js";
import {
  UpdateTrainerPackagingCandidateRequestSchema,
} from "../../../shared/agent-trainer/schemas.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTrainerOptions(req, res, ["GET", "PATCH"])) {
    return;
  }

  const admin = await requireTrainerGovernanceAdmin(req, res);
  if (!admin) {
    return;
  }

  try {
    const candidateId = extractRouteParam(req.query.id, "id");

    if (req.method === "GET") {
      const candidate = await getTrainerPackagingCandidate(candidateId);
      sendJson(res, 200, { candidate });
      return;
    }

    if (req.method !== "PATCH") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    const input = UpdateTrainerPackagingCandidateRequestSchema.parse(req.body ?? {});
    const currentCandidate = await getTrainerPackagingCandidate(candidateId);

    if (input.status === "kit_approved") {
      const gate = await evaluateTrainerPackagingGate(currentCandidate.experimentId);
      if (gate.unmetGates.length > 0) {
        sendJson(res, 409, {
          error: "Packaging candidate cannot be approved while gate requirements remain unmet.",
          unmetGates: gate.unmetGates,
        });
        return;
      }
    }

    const candidate = await updateTrainerPackagingCandidate(
      candidateId,
      input,
      admin.email || "Keith"
    );
    sendJson(res, 200, { candidate });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to update packaging candidate.",
    });
  }
}
