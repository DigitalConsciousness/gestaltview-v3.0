import type { ApiResult, MemoryEntry } from "./_lib/contracts";
import { createServiceRoleClient, type OperatorKitEnv } from "./_lib/supabaseClient";

export interface CreateMemoryInput {
  userId: string;
  sessionId: string;
  key: string;
  value: Record<string, unknown>;
  importance?: number;
  metadata?: Record<string, unknown>;
}

export function buildMemoryInsert(input: CreateMemoryInput): Record<string, unknown> {
  return {
    user_id: input.userId,
    session_id: input.sessionId,
    key: input.key,
    value: input.value,
    importance: input.importance ?? 2,
    metadata: input.metadata ?? {}
  };
}

function mapMemoryEntry(row: Record<string, unknown>): MemoryEntry {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    sessionId: String(row.session_id),
    key: String(row.key),
    value: (row.value as Record<string, unknown>) ?? {},
    importance: Number(row.importance ?? 2),
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

export async function getSessionMemory(
  env: OperatorKitEnv,
  userId: string,
  sessionId: string
): Promise<ApiResult<MemoryEntry[]>> {
  const supabase = createServiceRoleClient(env);
  const { data, error } = await supabase
    .from("memory_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return {
    data: (data ?? []).map((row) => mapMemoryEntry(row as Record<string, unknown>)),
    error: null
  };
}

export async function writeMemoryEntry(
  env: OperatorKitEnv,
  input: CreateMemoryInput
): Promise<ApiResult<MemoryEntry>> {
  const supabase = createServiceRoleClient(env);
  const { data, error } = await supabase
    .from("memory_entries")
    .insert(buildMemoryInsert(input))
    .select("*")
    .single();

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return { data: mapMemoryEntry(data as Record<string, unknown>), error: null };
}

export async function deleteMemoryEntry(
  env: OperatorKitEnv,
  memoryId: string
): Promise<ApiResult<{ id: string }>> {
  const supabase = createServiceRoleClient(env);
  const { error } = await supabase
    .from("memory_entries")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", memoryId);

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return { data: { id: memoryId }, error: null };
}
