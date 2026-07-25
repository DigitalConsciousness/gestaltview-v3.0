import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL?.trim() || '';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_KEY?.trim() ||
  '';

let supabaseClient: SupabaseClient | null | undefined;

export type UserTier = 'anonymous' | 'free' | 'core' | 'pro' | 'enterprise';

interface UserRateLimitRow {
  tier: UserTier | null;
  billy_query_count: number | null;
  billing_period_start?: string | null;
}

interface SessionRateLimitRow {
  query_count: number | null;
  window_start: string | null;
}

const TIER_LIMITS: Record<UserTier, number> = {
  anonymous: 2,
  free: 10,
  core: -1,
  pro: -1,
  enterprise: -1,
};

export const TIER_FEATURES: Record<
  UserTier,
  {
    billyUnlimited: boolean;
    claudeAccess: boolean;
    plkMemory: boolean;
    domainLanes: number | 'all';
    diligenceExports: boolean;
    symbioCoderAccess: boolean;
    adhdFullAccess: boolean;
    collaboratorEngineAccess: boolean;
    resumeRockstarAccess: boolean;
  }
> = {
  anonymous: {
    billyUnlimited: false,
    claudeAccess: false,
    plkMemory: false,
    domainLanes: 0,
    diligenceExports: false,
    symbioCoderAccess: false,
    adhdFullAccess: false,
    collaboratorEngineAccess: false,
    resumeRockstarAccess: false,
  },
  free: {
    billyUnlimited: false,
    claudeAccess: false,
    plkMemory: false,
    domainLanes: 1,
    diligenceExports: false,
    symbioCoderAccess: false,
    adhdFullAccess: false,
    collaboratorEngineAccess: false,
    resumeRockstarAccess: false,
  },
  core: {
    billyUnlimited: true,
    claudeAccess: false,
    plkMemory: true,
    domainLanes: 2,
    diligenceExports: false,
    symbioCoderAccess: false,
    adhdFullAccess: true,
    collaboratorEngineAccess: false,
    resumeRockstarAccess: true,
  },
  pro: {
    billyUnlimited: true,
    claudeAccess: true,
    plkMemory: true,
    domainLanes: 'all',
    diligenceExports: true,
    symbioCoderAccess: true,
    adhdFullAccess: true,
    collaboratorEngineAccess: false,
    resumeRockstarAccess: true,
  },
  enterprise: {
    billyUnlimited: true,
    claudeAccess: true,
    plkMemory: true,
    domainLanes: 'all',
    diligenceExports: true,
    symbioCoderAccess: true,
    adhdFullAccess: true,
    collaboratorEngineAccess: true,
    resumeRockstarAccess: true,
  },
};

export interface SessionState {
  tier: UserTier;
  queryCount: number;
  queryLimit: number;
  remaining: number;
  isLimited: boolean;
  userId?: string;
}

function getSupabase(): SupabaseClient | null {
  if (supabaseClient !== undefined) {
    return supabaseClient;
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    supabaseClient = null;
    return supabaseClient;
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  return supabaseClient;
}

function buildAnonymousState(queryCount = 0): SessionState {
  const limit = TIER_LIMITS.anonymous;

  return {
    tier: 'anonymous',
    queryCount,
    queryLimit: limit,
    remaining: Math.max(0, limit - queryCount),
    isLimited: queryCount >= limit,
  };
}

function buildLoggedInFallbackState(userId: string): SessionState {
  const limit = TIER_LIMITS.free;

  return {
    tier: 'free',
    queryCount: 0,
    queryLimit: limit,
    remaining: limit,
    isLimited: false,
    userId,
  };
}

export async function checkAndIncrementLimit(
  sessionId: string,
  userId?: string
): Promise<SessionState> {
  const supabase = getSupabase();

  if (!supabase) {
    return userId ? buildLoggedInFallbackState(userId) : buildAnonymousState();
  }

  if (userId) {
    const { data: user } = await supabase
      .from('users')
      .select('tier, billy_query_count, billing_period_start')
      .eq('id', userId)
      .single<UserRateLimitRow>();

    const tier: UserTier = user?.tier || 'free';
    const limit = TIER_LIMITS[tier];
    const currentCount = user?.billy_query_count ?? 0;

    if (limit === -1) {
      await supabase
        .from('users')
        .update({ billy_query_count: currentCount + 1 })
        .eq('id', userId);

      return {
        tier,
        queryCount: currentCount + 1,
        queryLimit: -1,
        remaining: -1,
        isLimited: false,
        userId,
      };
    }

    if (currentCount >= limit) {
      return {
        tier,
        queryCount: currentCount,
        queryLimit: limit,
        remaining: 0,
        isLimited: true,
        userId,
      };
    }

    await supabase
      .from('users')
      .update({ billy_query_count: currentCount + 1 })
      .eq('id', userId);

    return {
      tier,
      queryCount: currentCount + 1,
      queryLimit: limit,
      remaining: limit - (currentCount + 1),
      isLimited: false,
      userId,
    };
  }

  const windowStart = new Date();
  windowStart.setHours(0, 0, 0, 0);

  const { data: existing } = await supabase
    .from('session_rate_limits')
    .select('query_count, window_start')
    .eq('session_id', sessionId)
    .single<SessionRateLimitRow>();

  const limit = TIER_LIMITS.anonymous;
  const currentCount = existing?.query_count ?? 0;
  const existingWindowStart = existing?.window_start ?? null;
  const isNewWindow = !existingWindowStart || new Date(existingWindowStart) < windowStart;

  if (isNewWindow) {
    await supabase.from('session_rate_limits').upsert({
      session_id: sessionId,
      query_count: 1,
      window_start: windowStart.toISOString(),
      updated_at: new Date().toISOString(),
    });

    return {
      tier: 'anonymous',
      queryCount: 1,
      queryLimit: limit,
      remaining: limit - 1,
      isLimited: false,
    };
  }

  if (currentCount >= limit) {
    return {
      tier: 'anonymous',
      queryCount: currentCount,
      queryLimit: limit,
      remaining: 0,
      isLimited: true,
    };
  }

  await supabase.from('session_rate_limits').upsert({
    session_id: sessionId,
    query_count: currentCount + 1,
    window_start: existingWindowStart,
    updated_at: new Date().toISOString(),
  });

  return {
    tier: 'anonymous',
    queryCount: currentCount + 1,
    queryLimit: limit,
    remaining: limit - (currentCount + 1),
    isLimited: false,
  };
}

export async function getSessionState(
  sessionId: string,
  userId?: string
): Promise<SessionState> {
  const supabase = getSupabase();

  if (!supabase) {
    return userId ? buildLoggedInFallbackState(userId) : buildAnonymousState();
  }

  if (userId) {
    const { data: user } = await supabase
      .from('users')
      .select('tier, billy_query_count')
      .eq('id', userId)
      .single<UserRateLimitRow>();

    const tier: UserTier = user?.tier || 'free';
    const limit = TIER_LIMITS[tier];
    const currentCount = user?.billy_query_count ?? 0;

    return {
      tier,
      queryCount: currentCount,
      queryLimit: limit,
      remaining: limit === -1 ? -1 : Math.max(0, limit - currentCount),
      isLimited: limit !== -1 && currentCount >= limit,
      userId,
    };
  }

  const { data: existing } = await supabase
    .from('session_rate_limits')
    .select('query_count')
    .eq('session_id', sessionId)
    .single<SessionRateLimitRow>();

  const currentCount = existing?.query_count ?? 0;
  const limit = TIER_LIMITS.anonymous;

  return {
    tier: 'anonymous',
    queryCount: currentCount,
    queryLimit: limit,
    remaining: Math.max(0, limit - currentCount),
    isLimited: currentCount >= limit,
  };
}
