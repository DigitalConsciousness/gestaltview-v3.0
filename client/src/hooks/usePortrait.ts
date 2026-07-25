import { useCallback, useEffect, useState } from "react";

import { appFetchJson } from "@/lib/appFetch";
import type { PersonalityProfile } from "@shared/profileIngestion";
import type { ProfilePortrait } from "@shared/profilePortrait";

type PortraitEnvelope = {
  profile: PersonalityProfile;
  portrait: ProfilePortrait | null;
};

export interface UsePortraitResult {
  profile: PersonalityProfile | null;
  portrait: ProfilePortrait | null;
  isLoading: boolean;
  error?: Error;
  refetch: () => Promise<void>;
}

export function usePortrait(userId: string | null | undefined, contextFraming = ""): UsePortraitResult {
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [portrait, setPortrait] = useState<ProfilePortrait | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const refetch = useCallback(async () => {
    const effectiveUserId = userId?.trim() || "";
    if (!effectiveUserId) {
      setProfile(null);
      setPortrait(null);
      setError(undefined);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    const query = new URLSearchParams({ userId: effectiveUserId });
    if (contextFraming.trim()) {
      query.set("contextFraming", contextFraming.trim());
    }

    const result = await appFetchJson<PortraitEnvelope>(`/api/profile/personality?${query.toString()}`, {
      retries: 1,
    });

    if (result.ok) {
      setProfile(result.data.profile);
      setPortrait(result.data.portrait ?? null);
    } else {
      setError(new Error(result.message));
    }

    setIsLoading(false);
  }, [contextFraming, userId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { profile, portrait, isLoading, error, refetch };
}
