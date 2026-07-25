// GestaltView v2 — Perplexity Computer Tools Index
// © 2026 Keith Soyka / GestaltView
//
// Central registry for all Perplexity Computer tools available
// in the GestaltView integration.

export { definition as retrieveManifestContext } from "./retrieve_manifest_context";
export { definition as runBilly } from "./run_billy";
export { definition as tribunalEvaluate } from "./tribunal_evaluate";
export { definition as generateDiligenceReport } from "./generate_diligence_report";
export { definition as symbiocoderEdit } from "./symbiocoder_edit";

export const TOOL_REGISTRY = [
  "retrieve_manifest_context",
  "run_billy",
  "tribunal_evaluate",
  "generate_diligence_report",
  "symbiocoder_edit",
] as const;

export type ToolName = (typeof TOOL_REGISTRY)[number];
