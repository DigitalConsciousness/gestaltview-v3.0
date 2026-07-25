import type { VercelRequest, VercelResponse } from "@vercel/node";

import { getEmbodimentProfile } from "../../shared/embodiment/index.js";
import { sendJson } from "../_lib/response.js";

const ROUTE_ASSIGNMENTS: Record<string, { slug: string; label: string; description: string }> = {
  "/dynamic-inner-world": {
    slug: "curator",
    label: "Dynamic Inner World Curator",
    description: "Guides artifact exploration and self-reflection.",
  },
  "/profile": {
    slug: "sanctuary-keeper",
    label: "Profile Keeper",
    description: "Stewards memory and identity continuity.",
  },
  "/module/resume-rockstar": {
    slug: "the-weaver",
    label: "Resume Rockstar",
    description: "Shapes career narrative into usable resume artifacts.",
  },
  "/workspace/modules/resume-rockstar": {
    slug: "the-weaver",
    label: "Resume Rockstar",
    description: "Shapes career narrative into usable resume artifacts.",
  },
  "/module/symbio-coder": {
    slug: "the-architect",
    label: "Symbio Coder",
    description: "Assists with code structure and technical learning.",
  },
  "/workspace/modules/symbio-coder": {
    slug: "the-architect",
    label: "Symbio Coder",
    description: "Assists with code structure and technical learning.",
  },
  "/module/vibe-coder": {
    slug: "rock-legend",
    label: "Vibe Coder",
    description: "Connects musical and creative signals to identity.",
  },
  "/workspace/modules/vibe-coder": {
    slug: "rock-legend",
    label: "Vibe Coder",
    description: "Connects musical and creative signals to identity.",
  },
  "/creation-corner": {
    slug: "art-teacher",
    label: "Creation Corner Art Teacher",
    description: "Facilitates creative expression.",
  },
  "/musical-dna": {
    slug: "rock-legend",
    label: "Music DNA Guide",
    description: "Connects music to identity without flattening it.",
  },
  "/sanctuary": {
    slug: "sanctuary-keeper",
    label: "Sanctuary Guide",
    description: "Provides refuge and grounding.",
  },
};

function getPath(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || "/";
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const path = getPath(req.query.path);
  const assignment = ROUTE_ASSIGNMENTS[path] ?? null;

  if (!assignment) {
    sendJson(res, 200, {
      response: {
        embodimentProfile: null,
        assignment: null,
        available: false,
      },
      provider: "internal",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  sendJson(res, 200, {
    response: {
      embodimentProfile: getEmbodimentProfile(assignment.slug),
      assignment,
      available: true,
    },
    provider: "internal",
    timestamp: new Date().toISOString(),
  });
}
