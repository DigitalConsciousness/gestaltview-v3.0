import type { ApiResult, KnowledgeFragment } from "./_lib/contracts";
import { createServiceRoleClient, type OperatorKitEnv } from "./_lib/supabaseClient";

export interface CreateKnowledgeInput {
  userId: string;
  namespace: KnowledgeFragment["namespace"];
  title: string;
  content: string;
  sourceUri?: string;
  sourceType?: string;
  chunkIndex?: number;
  metadata?: Record<string, unknown>;
}

export function buildKnowledgeInsert(input: CreateKnowledgeInput): Record<string, unknown> {
  return {
    user_id: input.userId,
    namespace: input.namespace,
    title: input.title,
    content: input.content,
    source_uri: input.sourceUri ?? null,
    source_type: input.sourceType ?? null,
    chunk_index: input.chunkIndex ?? 0,
    metadata: input.metadata ?? {}
  };
}

function mapKnowledgeFragment(row: Record<string, unknown>): KnowledgeFragment {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    namespace: row.namespace as KnowledgeFragment["namespace"],
    title: String(row.title),
    content: String(row.content),
    sourceUri: row.source_uri ? String(row.source_uri) : null,
    sourceType: row.source_type ? String(row.source_type) : null,
    chunkIndex: Number(row.chunk_index ?? 0),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at ? String(row.created_at) : undefined
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

export async function listKnowledge(
  env: OperatorKitEnv,
  userId: string,
  limit = 25
): Promise<ApiResult<KnowledgeFragment[]>> {
  const supabase = createServiceRoleClient(env);
  const { data, error } = await supabase
    .from("knowledge_fragments")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return {
    data: (data ?? []).map((row: unknown) =>
      mapKnowledgeFragment(row as Record<string, unknown>)
    ),
    error: null
  };
}

export async function createKnowledge(
  env: OperatorKitEnv,
  input: CreateKnowledgeInput
): Promise<ApiResult<KnowledgeFragment>> {
  const supabase = createServiceRoleClient(env);
  const { data, error } = await supabase
    .from("knowledge_fragments")
    .insert(buildKnowledgeInsert(input))
    .select("*")
    .single();

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return {
    data: mapKnowledgeFragment(data as Record<string, unknown>),
    error: null
  };
}

export async function updateKnowledge(
  env: OperatorKitEnv,
  knowledgeId: string,
  patch: Partial<CreateKnowledgeInput>
): Promise<ApiResult<KnowledgeFragment>> {
  const supabase = createServiceRoleClient(env);
  const { data, error } = await supabase
    .from("knowledge_fragments")
    .update({
      namespace: patch.namespace,
      title: patch.title,
      content: patch.content,
      source_uri: patch.sourceUri,
      source_type: patch.sourceType,
      chunk_index: patch.chunkIndex,
      metadata: patch.metadata
    })
    .eq("id", knowledgeId)
    .select("*")
    .single();

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return {
    data: mapKnowledgeFragment(data as Record<string, unknown>),
    error: null
  };
}

export async function softDeleteKnowledge(
  env: OperatorKitEnv,
  knowledgeId: string
): Promise<ApiResult<{ id: string }>> {
  const supabase = createServiceRoleClient(env);
  const { error } = await supabase
    .from("knowledge_fragments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", knowledgeId);

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return { data: { id: knowledgeId }, error: null };
}

export async function searchKnowledge(
  env: OperatorKitEnv,
  userId: string,
  queryText: string,
  namespace?: KnowledgeFragment["namespace"]
): Promise<ApiResult<KnowledgeFragment[]>> {
  const supabase = createServiceRoleClient(env);
  const { data, error } = await supabase.rpc("search_knowledge", {
    query_text: queryText,
    requesting_user: userId,
    namespace_filter: namespace ?? null,
    limit_count: 8
  });

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return {
    data: (data ?? []).map((row: unknown) =>
      mapKnowledgeFragment(row as Record<string, unknown>)
    ),
    error: null
  };
}
