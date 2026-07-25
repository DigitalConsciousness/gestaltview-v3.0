import { createClient } from "npm:@supabase/supabase-js@2.49.8";
import { handleCors } from "../_shared/cors.ts";
import { errorResponse, jsonResponse, readJson } from "../_shared/json.ts";

type CapturePayload = {
  user_id?: string;
  session_id?: string;
  module_key: string;
  action: string;
  source_surface?: string;
  original_text?: string;
  original_payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

function createUserScopedClient(req: Request) {
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon)
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required.");

  return createClient(url, anon, {
    global: {
      headers: {
        Authorization: req.headers.get("Authorization") ?? "",
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return errorResponse(req, 405, "Method not allowed. Use POST.");
  }

  try {
    const payload = await readJson<CapturePayload>(req);
    if (!payload.module_key)
      return errorResponse(req, 400, "module_key is required.");
    if (!payload.action) return errorResponse(req, 400, "action is required.");

    const supabase = createUserScopedClient(req);
    const { data: userData } = await supabase.auth.getUser();
    const userId = payload.user_id ?? userData.user?.id ?? null;

    const { data, error } = await supabase
      .from("gsvw_runtime_capture_events")
      .insert({
        user_id: userId,
        session_id: payload.session_id ?? null,
        module_key: payload.module_key,
        action: payload.action,
        source_surface: payload.source_surface ?? null,
        original_text: payload.original_text ?? null,
        original_payload: payload.original_payload ?? {},
        metadata: payload.metadata ?? {},
        status: "captured",
      })
      .select("event_id, created_at")
      .single();

    if (error) throw error;
    return jsonResponse(req, { ok: true, event: data });
  } catch (error) {
    return errorResponse(
      req,
      500,
      error instanceof Error ? error.message : String(error),
    );
  }
});
