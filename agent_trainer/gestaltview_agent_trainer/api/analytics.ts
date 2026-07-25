import type { AnalyticsEvent, AnalyticsSummary, ApiResult } from "./_lib/contracts";
import { createServiceRoleClient, type OperatorKitEnv } from "./_lib/supabaseClient";

function asApiError(error: { message?: string; code?: string } | null) {
  if (!error) {
    return null;
  }

  return {
    message: error.message ?? "Unknown Supabase error.",
    code: error.code
  };
}

export async function logUsageEvent(
  env: OperatorKitEnv,
  event: AnalyticsEvent
): Promise<ApiResult<AnalyticsEvent>> {
  const supabase = createServiceRoleClient(env);
  const { data, error } = await supabase
    .from("usage_events")
    .insert({
      user_id: event.userId ?? null,
      event_type: event.eventType,
      metadata: event.metadata
    })
    .select("*")
    .single();

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  return {
    data: {
      id: String((data as Record<string, unknown>).id),
      userId: (data as Record<string, unknown>).user_id
        ? String((data as Record<string, unknown>).user_id)
        : null,
      eventType: String((data as Record<string, unknown>).event_type),
      metadata: ((data as Record<string, unknown>).metadata as Record<string, unknown>) ?? {},
      createdAt: String((data as Record<string, unknown>).created_at)
    },
    error: null
  };
}

export async function getAnalyticsSummary(
  env: OperatorKitEnv,
  userId?: string
): Promise<ApiResult<AnalyticsSummary>> {
  const supabase = createServiceRoleClient(env);
  let query = supabase
    .from("usage_events")
    .select("event_type")
    .is("deleted_at", null);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: asApiError(error) };
  }

  const byType = (data ?? []).reduce<Record<string, number>>((accumulator, row) => {
    const eventType = String((row as Record<string, unknown>).event_type);
    accumulator[eventType] = (accumulator[eventType] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    data: {
      totalEvents: (data ?? []).length,
      byType
    },
    error: null
  };
}
