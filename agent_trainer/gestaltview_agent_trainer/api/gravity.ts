import { createHash } from "node:crypto";

import type { ApiResult } from "./_lib/contracts";
import { createServiceRoleClient, type OperatorKitEnv } from "./_lib/supabaseClient";
import {
  buildChunkSignalWeight,
  runTwoPassGravityProtocol,
  type GravityConfidence,
  type TwoPassGravityResult,
} from "../../../shared/gravity/index.js";

export interface CreateGravityReportInput {
  id?: string;
  userId: string;
  sourceTitle: string;
  content: string;
  sourceUri?: string | null;
  sourceType?: string | null;
  sourceKind?: string | null;
  metadata?: Record<string, unknown>;
}

export interface CreateGravityReportFragmentLinkInput {
  id?: string;
  userId: string;
  gravityReportId: string;
  knowledgeFragmentId: string;
  chunkIndex: number;
  priorityRank: number;
  signalWeight: number;
  metadata?: Record<string, unknown>;
}

export interface GravityReportRow {
  id: string;
  user_id: string;
  source_title: string;
  source_uri: string | null;
  source_type: string | null;
  source_kind: string | null;
  source_fingerprint: string;
  surface_map: TwoPassGravityResult["surface_map"];
  gravity_report: TwoPassGravityResult["gravity_report"];
  signal_weight: number;
  confidence: GravityConfidence;
  metadata: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface GravityReportFragmentLinkRow {
  id: string;
  user_id: string;
  gravity_report_id: string;
  knowledge_fragment_id: string;
  chunk_index: number;
  priority_rank: number;
  signal_weight: number;
  metadata: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

function asApiError(error: { message?: string; code?: string } | null) {
  if (!error) {
    return null;
  }

  return {
    message: error.message ?? "Unknown Supabase error.",
    code: error.code,
  };
}

function fingerprintContent(content: string): string {
  return createHash("sha256").update(content.replace(/\s+/g, " ").trim()).digest("hex");
}

export function analyzeGravity(input: {
  title: string;
  content: string;
  sourceType?: string | null;
  context?: string | null;
}): TwoPassGravityResult {
  return runTwoPassGravityProtocol({
    title: input.title,
    text: input.content,
    source_type: input.sourceType ?? undefined,
    context: input.context ?? undefined,
  });
}

export function buildGravityReportInsert(input: CreateGravityReportInput): Record<string, unknown> {
  const notes =
    typeof input.metadata?.notes === "string" ? input.metadata.notes : undefined;
  const analysis = analyzeGravity({
    title: input.sourceTitle,
    content: input.content,
    sourceType: input.sourceType,
    context: notes,
  });

  const normalizedContent = input.content.replace(/\s+/g, " ").trim();

  return {
    id: input.id,
    user_id: input.userId,
    source_title: input.sourceTitle,
    source_uri: input.sourceUri ?? null,
    source_type: input.sourceType ?? null,
    source_kind: input.sourceKind ?? null,
    source_fingerprint: fingerprintContent(normalizedContent),
    surface_map: analysis.surface_map,
    gravity_report: analysis.gravity_report,
    signal_weight: analysis.signal_weight,
    confidence: analysis.gravity_report.confidence,
    metadata: {
      ...(input.metadata ?? {}),
      analysis_version: "two-pass-gravity-v1",
    },
  };
}

export function buildGravityReportFragmentLinkInsert(
  input: CreateGravityReportFragmentLinkInput
): Record<string, unknown> {
  return {
    id: input.id,
    user_id: input.userId,
    gravity_report_id: input.gravityReportId,
    knowledge_fragment_id: input.knowledgeFragmentId,
    chunk_index: input.chunkIndex,
    priority_rank: input.priorityRank,
    signal_weight: input.signalWeight,
    metadata: {
      ...(input.metadata ?? {}),
    },
  };
}

export async function createGravityReport(
  env: OperatorKitEnv,
  input: CreateGravityReportInput
): Promise<ApiResult<GravityReportRow>> {
  const supabase = createServiceRoleClient(env);
  const { data, error } = await supabase
    .from("gravity_reports")
    .insert(buildGravityReportInsert(input))
    .select("*")
    .single();

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return {
    data: data as GravityReportRow,
    error: null,
  };
}

export async function linkGravityReportFragment(
  env: OperatorKitEnv,
  input: CreateGravityReportFragmentLinkInput
): Promise<ApiResult<GravityReportFragmentLinkRow>> {
  const supabase = createServiceRoleClient(env);
  const { data, error } = await supabase
    .from("gravity_report_fragments")
    .insert(buildGravityReportFragmentLinkInsert(input))
    .select("*")
    .single();

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return {
    data: data as GravityReportFragmentLinkRow,
    error: null,
  };
}

export async function listGravityReports(
  env: OperatorKitEnv,
  userId: string,
  limit = 25
): Promise<ApiResult<GravityReportRow[]>> {
  const supabase = createServiceRoleClient(env);
  const { data, error } = await supabase
    .from("gravity_reports")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return {
    data: (data ?? []) as GravityReportRow[],
    error: null,
  };
}

export function scoreFragmentGravity(
  report: TwoPassGravityResult,
  chunkText: string,
  chunkIndex = 0
): number {
  return buildChunkSignalWeight(report, chunkText, chunkIndex);
}
