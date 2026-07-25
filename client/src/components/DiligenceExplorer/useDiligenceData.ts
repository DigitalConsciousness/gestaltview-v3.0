import { useEffect, useState } from "react";
import type { DiligenceData } from "./types";

interface UseDiligenceDataResult {
  data: DiligenceData | null;
  loading: boolean;
  error: string | null;
}

export function useDiligenceData(): UseDiligenceDataResult {
  const [data, setData] = useState<DiligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/diligence")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        return response.json();
      })
      .then((payload: DiligenceData) => setData(payload))
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
