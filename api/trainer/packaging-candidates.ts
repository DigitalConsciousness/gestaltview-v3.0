import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../_lib/response.js";
import {
  handleTrainerOptions,
  requireTrainerGovernanceAdmin,
} from "./_helpers.js";
import {
  createTrainerPackagingCandidate,
  evaluateTrainerPackagingGate,
  listTrainerPackagingCandidates,
} from "../../server/trainer/experiment-repository.js";
import {
  CreateTrainerPackagingCandidateRequestSchema,
} from "../../shared/agent-trainer/schemas.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTrainerOptions(req, res, ["GET", "POST"])) {
    return;
  }

  const admin = await requireTrainerGovernanceAdmin(req, res);
  if (!admin) {
    return;
  }

  try {
    if (req.method === "GET") {
      const candidates = await listTrainerPackagingCandidates();
      sendJson(res, 200, { candidates });
      return;
    }

    if (req.method === "POST") {
      const input = CreateTrainerPackagingCandidateRequestSchema.parse(req.body ?? {});
      const gate = await evaluateTrainerPackagingGate(input.experimentId);

      if (gate.unmetGates.length > 0) {
        sendJson(res, 409, {
          error: "Packaging gate requirements are not satisfied.",
          unmetGates: gate.unmetGates,
        });
        return;
      }

      const candidate = await createTrainerPackagingCandidate(
        input,
        admin.email || "Keith"
      );
      sendJson(res, 201, { candidate });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Packaging candidate request failed.",
    });
  }
}
