// api/billy-health.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView
//
// Health + readiness check for the Billy pipeline.
// Returns provider status, Supabase connectivity, corpus size, and RPC status.
//
// GET /api/billy-health

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson }                           from "./_lib/response";
import { checkPipelineHealth, invokeRpc }     from "./_lib/supabase";
import { routerStatus }                       from "./_lib/llmRouter";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
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

  const ok = supabase.ok && rpcOk;

  sendJson(res, ok ? 200 : 503, {
    ok,
    timestamp: new Date().toISOString(),
    supabase,
    rpc: {
      ok:      rpcOk,
      details: rpcOk ? "search_knowledge_fragments resolved cleanly" : "RPC error",
    },
    llm: llmStatus.status === "fulfilled" ? llmStatus.value : { error: String((llmStatus as PromiseRejectedResult).reason) },
  });
}
