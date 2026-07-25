import { useEffect, useState } from "react";
import { useLocation } from "wouter";

import { appFetchJson } from "@/lib/appFetch";
import type { EmbodimentProfile } from "@shared/embodiment";

type RouteEmbodimentEnvelope = {
  response: {
    embodimentProfile: EmbodimentProfile | null;
    assignment: {
      slug: string;
      label: string;
      description: string;
    } | null;
    available: boolean;
  };
};

export function useRouteEmbodiment() {
  const [location] = useLocation();
  const [embodiment, setEmbodiment] = useState<EmbodimentProfile | null>(null);

  useEffect(() => {
    let cancelled = false;

    void appFetchJson<RouteEmbodimentEnvelope>(
      `/api/embodiments/by-route?path=${encodeURIComponent(location)}`,
      { retries: 1 },
    ).then((result) => {
      if (!cancelled && result.ok) {
        setEmbodiment(result.data.response.embodimentProfile);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [location]);

  return embodiment;
}
