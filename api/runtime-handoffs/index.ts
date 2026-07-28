import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ZodError } from "zod";

import { getAuthUser } from "../_lib/auth.js";
import { resolveRenderUserId } from "../render/user-id.js";
import { createRuntimeHandoffSchema } from "../../shared/handoffs/contracts.js";
import {
  createRuntimeHandoffRow,
  RUNTIME_HANDOFF_SELECT,
  rowToRuntimeHandoff,
  runtimeHandoffMaterialFingerprint,
  runtimeHandoffRequest,
  type RuntimeHandoffRow,
} from "./_shared.js";

function failure(
  res: VercelResponse,
  status: number,
  code: string,
  message: string,
) {
  return res.status(status).json({ ok: false, error: { code, message } });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return failure(res, 405, "METHOD_NOT_ALLOWED", "Only POST is supported.");
  }

  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return failure(
        res,
        401,
        "AUTHENTICATION_REQUIRED",
        "Authentication is required.",
      );
    }
    const ownerId = await resolveRenderUserId(authUser);
    const input = createRuntimeHandoffSchema.parse(req.body);
    const fingerprint = runtimeHandoffMaterialFingerprint(input);
    const idempotencyQuery = new URLSearchParams({
      owner_id: `eq.${ownerId}`,
      idempotency_key: `eq.${input.idempotencyKey}`,
      select: RUNTIME_HANDOFF_SELECT,
      limit: "1",
    });
    const existingResponse = await runtimeHandoffRequest(
      `/rest/v1/runtime_handoffs?${idempotencyQuery}`,
    );
    if (!existingResponse.ok) throw new Error("Runtime handoff lookup failed.");
    const existingRows = (await existingResponse.json()) as RuntimeHandoffRow[];
    const existing = existingRows[0];
    if (existing) {
      if (existing.material_fingerprint !== fingerprint) {
        return failure(
          res,
          409,
          "IDEMPOTENCY_MATERIAL_MISMATCH",
          "This idempotency key is already bound to materially different intent.",
        );
      }
      return res
        .status(200)
        .json({ ok: true, handoff: rowToRuntimeHandoff(existing) });
    }

    const createResponse = await runtimeHandoffRequest(
      `/rest/v1/runtime_handoffs?select=${encodeURIComponent(RUNTIME_HANDOFF_SELECT)}`,
      {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(
          createRuntimeHandoffRow(ownerId, input, fingerprint),
        ),
      },
    );
    if (!createResponse.ok) throw new Error("Runtime handoff creation failed.");
    const rows = (await createResponse.json()) as RuntimeHandoffRow[];
    return res
      .status(201)
      .json({ ok: true, handoff: rowToRuntimeHandoff(rows[0]) });
  } catch (error) {
    if (error instanceof ZodError) {
      return failure(
        res,
        400,
        "INVALID_HANDOFF",
        error.issues[0]?.message ?? "Invalid handoff.",
      );
    }
    return failure(
      res,
      503,
      "HANDOFF_PERSISTENCE_UNAVAILABLE",
      "The durable handoff could not be prepared.",
    );
  }
}
