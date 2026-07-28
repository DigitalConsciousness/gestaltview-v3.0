import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ZodError } from "zod";

import { getAuthUser } from "../_lib/auth.js";
import { resolveRenderUserId } from "../render/user-id.js";
import {
  canTransitionRuntimeHandoff,
  transitionRuntimeHandoffSchema,
} from "../../shared/handoffs/contracts.js";
import {
  RUNTIME_HANDOFF_SELECT,
  rowToRuntimeHandoff,
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
  if (
    req.method !== "GET" &&
    req.method !== "PATCH" &&
    req.method !== "DELETE"
  ) {
    res.setHeader("Allow", "GET, PATCH, DELETE");
    return failure(res, 405, "METHOD_NOT_ALLOWED", "Unsupported method.");
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
    const handoffId = String(req.query.id ?? "");
    if (!handoffId)
      return failure(res, 400, "HANDOFF_ID_REQUIRED", "handoffId is required.");
    const baseQuery = new URLSearchParams({
      handoff_id: `eq.${handoffId}`,
      owner_id: `eq.${ownerId}`,
      select: RUNTIME_HANDOFF_SELECT,
      limit: "1",
    });
    const currentResponse = await runtimeHandoffRequest(
      `/rest/v1/runtime_handoffs?${baseQuery}`,
    );
    if (!currentResponse.ok) throw new Error("Runtime handoff lookup failed.");
    const current = ((await currentResponse.json()) as RuntimeHandoffRow[])[0];
    if (!current) {
      return failure(
        res,
        404,
        "HANDOFF_NOT_FOUND",
        "Runtime handoff not found.",
      );
    }

    if (req.method === "GET") {
      return res
        .status(200)
        .json({ ok: true, handoff: rowToRuntimeHandoff(current) });
    }
    if (req.method === "DELETE") {
      const deleteResponse = await runtimeHandoffRequest(
        `/rest/v1/runtime_handoffs?handoff_id=eq.${encodeURIComponent(handoffId)}&owner_id=eq.${encodeURIComponent(ownerId)}`,
        { method: "DELETE" },
      );
      if (!deleteResponse.ok)
        throw new Error("Runtime handoff deletion failed.");
      return res.status(204).end();
    }

    const transition = transitionRuntimeHandoffSchema.parse(req.body);
    if (!canTransitionRuntimeHandoff(current.state, transition.state)) {
      return failure(
        res,
        409,
        "INVALID_HANDOFF_TRANSITION",
        `Cannot transition ${current.state} to ${transition.state}.`,
      );
    }
    const updateResponse = await runtimeHandoffRequest(
      `/rest/v1/runtime_handoffs?handoff_id=eq.${encodeURIComponent(handoffId)}&owner_id=eq.${encodeURIComponent(ownerId)}&select=${encodeURIComponent(RUNTIME_HANDOFF_SELECT)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          state: transition.state,
          ...(transition.receipt !== undefined
            ? { receipt: transition.receipt }
            : {}),
        }),
      },
    );
    if (!updateResponse.ok)
      throw new Error("Runtime handoff transition failed.");
    const updated = ((await updateResponse.json()) as RuntimeHandoffRow[])[0];
    return res
      .status(200)
      .json({ ok: true, handoff: rowToRuntimeHandoff(updated) });
  } catch (error) {
    if (error instanceof ZodError) {
      return failure(
        res,
        400,
        "INVALID_HANDOFF_TRANSITION",
        error.issues[0]?.message ?? "Invalid.",
      );
    }
    return failure(
      res,
      503,
      "HANDOFF_PERSISTENCE_UNAVAILABLE",
      "The durable handoff could not be read or changed.",
    );
  }
}
