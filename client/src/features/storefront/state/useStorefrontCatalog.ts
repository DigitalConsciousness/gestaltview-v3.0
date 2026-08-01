import { useEffect, useState } from "react";

import { fetchStorefrontCatalog } from "../api/catalog";
import { launchFallbackProducts, type StorefrontCatalogResponse } from "@shared/storefront/contracts";

type CatalogState = {
  catalog: StorefrontCatalogResponse;
  loading: boolean;
  error: string | null;
};

export function useStorefrontCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>({
    catalog: { source: "launch_fallback", checkoutEnabled: false, products: launchFallbackProducts },
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    fetchStorefrontCatalog(controller.signal)
      .then((catalog) => setState({ catalog, loading: false, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : "catalog_unavailable",
        }));
      });
    return () => controller.abort();
  }, []);

  return state;
}
