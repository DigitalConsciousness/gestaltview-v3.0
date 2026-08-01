import type { StorefrontCatalogResponse } from "@shared/storefront/contracts";

export async function fetchStorefrontCatalog(signal?: AbortSignal): Promise<StorefrontCatalogResponse> {
  const response = await fetch("/api/storefront/catalog", { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("catalog_unavailable");
  return response.json() as Promise<StorefrontCatalogResponse>;
}
