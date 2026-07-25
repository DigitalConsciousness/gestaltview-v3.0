import type { ApiResult, SkillFragment } from "./_lib/contracts";
import { createServiceRoleClient, type OperatorKitEnv } from "./_lib/supabaseClient";

export interface CreateSkillInput {
  userId: string;
  name: string;
  description: string;
  domain: SkillFragment["domain"];
  instructions?: string;
  active?: boolean;
  metadata?: Record<string, unknown>;
}

function mapSkillFragment(row: Record<string, unknown>): SkillFragment {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    description: String(row.description),
    domain: row.domain as SkillFragment["domain"],
    instructions: row.instructions ? String(row.instructions) : null,
    active: Boolean(row.active),
    metadata: (row.metadata as Record<string, unknown>) ?? {}
  };
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

export async function listSkills(
  env: OperatorKitEnv,
  userId: string
): Promise<ApiResult<SkillFragment[]>> {
  const supabase = createServiceRoleClient(env);
  const { data, error } = await supabase
    .from("skill_fragments")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return {
    data: (data ?? []).map((row) => mapSkillFragment(row as Record<string, unknown>)),
    error: null
  };
}

export async function createSkill(
  env: OperatorKitEnv,
  input: CreateSkillInput
): Promise<ApiResult<SkillFragment>> {
  const supabase = createServiceRoleClient(env);
  const { data, error } = await supabase
    .from("skill_fragments")
    .insert({
      user_id: input.userId,
      name: input.name,
      description: input.description,
      domain: input.domain,
      instructions: input.instructions ?? null,
      active: input.active ?? true,
      metadata: input.metadata ?? {}
    })
    .select("*")
    .single();

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return { data: mapSkillFragment(data as Record<string, unknown>), error: null };
}

export async function updateSkill(
  env: OperatorKitEnv,
  skillId: string,
  patch: Partial<CreateSkillInput>
): Promise<ApiResult<SkillFragment>> {
  const supabase = createServiceRoleClient(env);
  const { data, error } = await supabase
    .from("skill_fragments")
    .update({
      name: patch.name,
      description: patch.description,
      domain: patch.domain,
      instructions: patch.instructions,
      active: patch.active,
      metadata: patch.metadata
    })
    .eq("id", skillId)
    .select("*")
    .single();

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return { data: mapSkillFragment(data as Record<string, unknown>), error: null };
}

export async function softDeleteSkill(
  env: OperatorKitEnv,
  skillId: string
): Promise<ApiResult<{ id: string }>> {
  const supabase = createServiceRoleClient(env);
  const { error } = await supabase
    .from("skill_fragments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", skillId);

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return { data: { id: skillId }, error: null };
}
