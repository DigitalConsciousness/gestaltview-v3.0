import { useCallback, useEffect, useState } from "react";

import { appFetchJson } from "@/lib/appFetch";
import type { DynamicInnerWorldResponse } from "@shared/profileIngestion";

type DynamicInnerWorldEnvelope = {
  response: DynamicInnerWorldResponse;
  provider: string;
  timestamp: string;
};

export interface UseDynamicInnerWorldResult {
  data: DynamicInnerWorldResponse | null;
  isLoading: boolean;
  error?: Error;
  refetch: () => Promise<void>;
}

export function useDynamicInnerWorld(userId: string | null | undefined): UseDynamicInnerWorldResult {
  const [data, setData] = useState<DynamicInnerWorldResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const refetch = useCallback(async () => {
    const effectiveUserId = userId?.trim() || "demo";
    setIsLoading(true);
    setError(undefined);

    const result = await appFetchJson<DynamicInnerWorldEnvelope>(
      `/api/consciousness/dynamic-inner-world?userId=${encodeURIComponent(effectiveUserId)}`,
      { retries: 1 },
    );

    if (result.ok) {
      setData(result.data.response);
    } else {
      setError(new Error(result.message));
    }

    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
