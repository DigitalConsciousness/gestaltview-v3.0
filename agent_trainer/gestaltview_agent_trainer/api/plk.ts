import type { ApiResult, VocabularyProfile } from "./_lib/contracts";
import { createServiceRoleClient, type OperatorKitEnv } from "./_lib/supabaseClient";

export interface UpsertVocabularyProfileInput {
  userId: string;
  vocabulary: string[];
  tone: string;
  constraints: string[];
  metadata?: Record<string, unknown>;
}

function asApiError(error: { message?: string; code?: string } | null) {
  if (!error) {
    return null;
  }

  return {
    message: error.message ?? "Unknown Supabase error.",
    code: error.code
  };
}

function mapProfile(row: Record<string, unknown>): VocabularyProfile {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    vocabulary: ((row.vocabulary as unknown[]) ?? []).map((item) => String(item)),
    tone: String(row.tone ?? "clear"),
    constraints: ((row.constraints as unknown[]) ?? []).map((item) => String(item)),
    metadata: (row.metadata as Record<string, unknown>) ?? {}
  };
}

export async function getVocabularyProfile(
  env: OperatorKitEnv,
  userId: string
): Promise<ApiResult<VocabularyProfile>> {
  const supabase = createServiceRoleClient(env);
  const { data, error } = await supabase
    .from("plk_profiles")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return { data: mapProfile(data as Record<string, unknown>), error: null };
}

export async function upsertVocabularyProfile(
  env: OperatorKitEnv,
  input: UpsertVocabularyProfileInput
): Promise<ApiResult<VocabularyProfile>> {
  const supabase = createServiceRoleClient(env);
  const payload = {
    user_id: input.userId,
    vocabulary: input.vocabulary,
    tone: input.tone,
    constraints: input.constraints,
    metadata: input.metadata ?? {}
  };

  const { data, error } = await supabase
    .from("plk_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return { data: mapProfile(data as Record<string, unknown>), error: null };
}
