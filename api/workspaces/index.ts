import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import {
  deleteWorkspaceRoom,
  createWorkspaceRoom,
  listWorkspaceRooms,
  updateWorkspaceRoom,
} from "../_lib/supabase.js";
import { buildEntitlementBlock, canUseWorkspaceMutations } from "../../shared/entitlements.js";

function getQueryValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }

  return value?.trim() || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, {
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const auth = await requireAuth(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return;
  }

  try {
    if (req.method === "GET") {
      const workspaceId = getQueryValue(req.query.workspaceId);
      const workspaces = await listWorkspaceRooms(auth.id);
      sendJson(
        res,
        200,
        workspaceId
          ? { workspaces: workspaces.filter((workspace) => workspace.id === workspaceId) }
          : { workspaces }
      );
      return;
    }

    if (
      !canUseWorkspaceMutations({
        tier: auth.tier,
        isAdmin: auth.isAdmin,
      })
    ) {
      sendJson(
        res,
        403,
        buildEntitlementBlock(
          "workspaces",
          "Core unlocks workspace creation, editing, and shared room management.",
        ),
      );
      return;
    }

    if (req.method === "POST") {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const name = typeof body.name === "string" ? body.name.trim() : "";

      if (!name) {
        sendJson(res, 400, { error: "name is required" });
        return;
      }

      const room = await createWorkspaceRoom(auth.id, {
        name,
        description: typeof body.description === "string" ? body.description.trim() : null,
        role:
          body.role === "owner" ||
          body.role === "admin" ||
          body.role === "member" ||
          body.role === "viewer"
            ? body.role
            : "owner",
        member_count:
          typeof body.memberCount === "number"
            ? body.memberCount
            : typeof body.member_count === "number"
              ? body.member_count
              : 1,
        recent_activity:
          typeof body.recentActivity === "string"
            ? body.recentActivity.trim() || "Workspace created."
            : typeof body.recent_activity === "string"
              ? body.recent_activity.trim() || "Workspace created."
              : "Workspace created.",
      });

      if (!room) {
        sendJson(res, 503, { error: "Workspace persistence is unavailable." });
        return;
      }

      sendJson(res, 200, { workspace: room });
      return;
    }

    if (req.method === "PATCH") {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const workspaceId =
        (typeof body.id === "string" ? body.id.trim() : "") ||
        (typeof body.workspaceId === "string" ? body.workspaceId.trim() : "") ||
        (typeof req.query.id === "string" ? req.query.id.trim() : "");

      if (!workspaceId) {
        sendJson(res, 400, { error: "workspace id is required" });
        return;
      }

      const workspace = await updateWorkspaceRoom(auth.id, workspaceId, {
        name: typeof body.name === "string" ? body.name.trim() : undefined,
        description:
          "description" in body
            ? typeof body.description === "string"
              ? body.description.trim()
              : body.description === null
                ? null
                : undefined
            : undefined,
        role:
          body.role === "owner" ||
          body.role === "admin" ||
          body.role === "member" ||
          body.role === "viewer"
            ? body.role
            : undefined,
        member_count:
          typeof body.memberCount === "number"
            ? body.memberCount
            : typeof body.member_count === "number"
              ? body.member_count
              : undefined,
        recent_activity:
          typeof body.recentActivity === "string"
            ? body.recentActivity.trim()
            : typeof body.recent_activity === "string"
              ? body.recent_activity.trim()
              : undefined,
      });

      if (!workspace) {
        sendJson(res, 404, { error: "Workspace not found." });
        return;
      }

      sendJson(res, 200, { workspace });
      return;
    }

    if (req.method === "DELETE") {
      const workspaceId =
        (typeof req.query.id === "string" ? req.query.id.trim() : "") ||
        (typeof req.query.workspaceId === "string" ? req.query.workspaceId.trim() : "");

      if (!workspaceId) {
        sendJson(res, 400, { error: "workspace id is required" });
        return;
      }

      const deleted = await deleteWorkspaceRoom(auth.id, workspaceId);
      sendJson(res, deleted ? 200 : 404, { deleted });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Workspace request failed.",
    });
  }
}
