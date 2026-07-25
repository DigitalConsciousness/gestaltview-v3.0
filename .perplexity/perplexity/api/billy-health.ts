// api/billy-health.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView
//
// Health + readiness check for the Billy pipeline.
// Returns provider status, Supabase connectivity, corpus size, and RPC status.
//
// GET /api/billy-health

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson }                           from "./_lib/response.js";
import { applyCorsHeaders }                   from "./_lib/cors.js";
import { checkPipelineHealth, invokeRpc }     from "./_lib/supabase.js";
import { routerStatus }                       from "./_lib/llmRouter.js";
import { buildBillyVoiceHealth }              from "./_lib/billyVoice.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  applyCorsHeaders(req, res, {
    methods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  });

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const [supabaseHealth, llmStatus, rpcTest] = await Promise.allSettled([
    checkPipelineHealth(),
    routerStatus(),
    invokeRpc<{ count: number }[]>("search_knowledge_fragments", {
      query_text:     "Billy",
      match_count:    1,
      filter_type:    null,
      filter_package: null,
    }),
  ]);

  const supabase = supabaseHealth.status === "fulfilled"
    ? supabaseHealth.value
    : { ok: false, details: [String(supabaseHealth.reason)] };

  const rpcOk = rpcTest.status === "fulfilled" && Array.isArray(rpcTest.value);

  const llmResolved = llmStatus.status === "fulfilled"
    ? llmStatus.value as Record<string, { configured: boolean }>
    : null;
  const llmOk = llmResolved !== null
    && Object.values(llmResolved).some((p) => p.configured);

  const ok = supabase.ok && rpcOk && llmOk;
  const voice = buildBillyVoiceHealth();

  sendJson(res, ok ? 200 : 503, {
    ok,
    timestamp: new Date().toISOString(),
    supabase,
    rpc: {
      ok:      rpcOk,
      details: rpcOk ? "search_knowledge_fragments resolved cleanly" : "RPC error",
    },
    llm: llmStatus.status === "fulfilled" ? llmStatus.value : { error: String((llmStatus as PromiseRejectedResult).reason) },
    voice,
  });
}
