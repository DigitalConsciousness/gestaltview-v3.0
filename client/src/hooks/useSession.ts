import { useState, useEffect, useCallback } from 'react';
import { appFetchJson } from '@/lib/appFetch';

export type UserTier = 'anonymous' | 'free' | 'core' | 'pro' | 'enterprise';

export interface SessionState {
  tier: UserTier;
  queryCount: number;
  queryLimit: number;
  remaining: number;
  isLimited: boolean;
  userId?: string;
  isLoading: boolean;
  degraded?: boolean;
  reason?: string;
}

export interface TierFeatures {
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

const TIER_FEATURES: Record<UserTier, TierFeatures> = {
  anonymous: {
    billyUnlimited: false, claudeAccess: false, plkMemory: false,
    domainLanes: 0, diligenceExports: false, symbioCoderAccess: false,
    adhdFullAccess: false, collaboratorEngineAccess: false, resumeRockstarAccess: false,
  },
  free: {
    billyUnlimited: false, claudeAccess: false, plkMemory: false,
    domainLanes: 1, diligenceExports: false, symbioCoderAccess: false,
    adhdFullAccess: false, collaboratorEngineAccess: false, resumeRockstarAccess: false,
  },
  core: {
    billyUnlimited: true, claudeAccess: false, plkMemory: true,
    domainLanes: 2, diligenceExports: false, symbioCoderAccess: false,
    adhdFullAccess: true, collaboratorEngineAccess: false, resumeRockstarAccess: true,
  },
  pro: {
    billyUnlimited: true, claudeAccess: true, plkMemory: true,
    domainLanes: 'all', diligenceExports: true, symbioCoderAccess: true,
    adhdFullAccess: true, collaboratorEngineAccess: false, resumeRockstarAccess: true,
  },
  enterprise: {
    billyUnlimited: true, claudeAccess: true, plkMemory: true,
    domainLanes: 'all', diligenceExports: true, symbioCoderAccess: true,
    adhdFullAccess: true, collaboratorEngineAccess: true, resumeRockstarAccess: true,
  },
};

const TIER_LABELS: Record<UserTier, string> = {
  anonymous: 'Demo',
  free: 'Free',
  core: 'GestaltView Core',
  pro: 'GestaltView Pro',
  enterprise: 'Enterprise',
};

const INITIAL_STATE: SessionState = {
  tier: 'anonymous',
  queryCount: 0,
  queryLimit: 2,
  remaining: 2,
  isLimited: false,
  isLoading: true,
};

export function useSession() {
  const [session, setSession] = useState<SessionState>(INITIAL_STATE);

  const fetchState = useCallback(async () => {
    const result = await appFetchJson<Omit<SessionState, 'isLoading'>>('/api/session/state', {
      timeoutMs: 5_000,
      retries: 1,
    });

    if (result.ok) {
      setSession({ ...result.data, isLoading: false });
    } else {
      // Fail open — never block the user on a session error
      setSession({
        ...INITIAL_STATE,
        isLoading: false,
        degraded: true,
        reason: result.code,
      });
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Called by Billy and other gated components after each query
  const decrementRemaining = useCallback(() => {
    setSession((prev) => {
      const newCount = prev.queryCount + 1;
      const newRemaining = prev.queryLimit === -1 ? -1 : Math.max(0, prev.remaining - 1);
      return {
        ...prev,
        queryCount: newCount,
        remaining: newRemaining,
        isLimited: prev.queryLimit !== -1 && newRemaining <= 0,
      };
    });
  }, []);

  const features = TIER_FEATURES[session.tier];
  const tierLabel = TIER_LABELS[session.tier];

  const hasFeature = useCallback(
    (feature: keyof TierFeatures): boolean => {
      const val = features[feature];
      if (typeof val === 'boolean') return val;
      if (val === 'all') return true;
      if (typeof val === 'number') return val > 0;
      return false;
    },
    [features]
  );

  return {
    session,
    features,
    tierLabel,
    hasFeature,
    decrementRemaining,
    refresh: fetchState,
    isAnonymous: session.tier === 'anonymous',
    isPaid: ['core', 'pro', 'enterprise'].includes(session.tier),
  };
}
