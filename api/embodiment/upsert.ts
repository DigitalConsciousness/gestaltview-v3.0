import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import {
  getProfileValidationError,
  getServiceClient,
  isFounderStudioEnabled,
  normalizeProfilePayload,
  parseRequestBody,
} from "./_shared.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, {
    methods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  if (!isFounderStudioEnabled()) {
    sendJson(res, 403, { error: "Founder studio is not enabled." });
    return;
  }

  let payload: unknown;

  try {
    payload = parseRequestBody(req.body);
  } catch {
    sendJson(res, 400, { error: "Invalid JSON payload." });
    return;
  }

  const validationError = getProfileValidationError(payload);
  if (validationError) {
    sendJson(res, 400, { error: validationError });
    return;
  }

  const profile = normalizeProfilePayload(payload);

  try {
    const supabase = getServiceClient() as any;
    const { data, error } = await supabase
      .from("embodiment_profiles")
      .upsert(
        {
          slug: profile.slug,
          public_name: profile.publicName,
          internal_designation: profile.internalDesignation ?? null,
          status: profile.profileStatus ?? "draft",
          visibility_scope: profile.visibilityScope ?? "founder-only",
          profile_json: profile,
          readiness_score: profile.readinessScore ?? 0,
          founder_notes: null,
        },
        { onConflict: "slug" }
      )
      .select("id, slug, status, updated_at")
      .single();

    if (error) {
      sendJson(res, 500, { error: error.message });
      return;
    }

    if (data) {
      const { error: trainingError } = await supabase.from("embodiment_training_runs").insert({
        embodiment_profile_id: data.id,
        run_type: "manual_edit",
        input_snapshot: profile,
        output_snapshot: data,
        accepted: true,
        founder_notes: "Upserted via Embodiment Studio upload.",
      });

      if (trainingError) {
        console.warn("[embodiment/upsert] training log insert failed:", trainingError);
      }
    }

    sendJson(res, 200, { success: true, profile: data });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Internal server error.",
    });
  }
}
