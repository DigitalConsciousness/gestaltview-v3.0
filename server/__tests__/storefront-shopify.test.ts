import { describe, expect, it } from "vitest";

import { getStorefrontCatalog } from "../storefront/shopify.js";

describe("Shopify storefront catalog", () => {
  it("falls back safely without exposing checkout when configuration is absent", async () => {
    const catalog = await getStorefrontCatalog({} as NodeJS.ProcessEnv);
    expect(catalog.source).toBe("launch_fallback");
    expect(catalog.checkoutEnabled).toBe(false);
    expect(catalog.products.map((product) => product.commerceRoute)).toEqual([
      "free_issue",
      "gestaltview_requisition",
    ]);
  });

  it("accepts only explicitly routed products with complete edition metadata", async () => {
    const fetcher = async (_url: string | URL | Request, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body));
      expect(request.query).not.toMatch(/customer|buyer|biography|memory|accessToken/i);
      return new Response(JSON.stringify({
        data: {
          products: {
            nodes: [
              {
                id: "gid://shopify/Product/1",
                handle: "field-manual",
                title: "Working Alongside Digital Intelligence — Field Manual",
                description: "A practical authored edition.",
                featuredImage: null,
                offerKind: { value: "artifact" },
                commerceRoute: { value: "shopify_checkout" },
                artifactEdition: { reference: {
                  name: { value: "Field Manual" }, version: { value: "1.0.0" },
                  formats: { value: '["PDF","Accessible HTML"]' },
                  license: { value: "Personal-use edition" },
                  updatePolicy: { value: "Patch corrections included" },
                  provenanceSummary: { value: "Authored derivative; manually reviewed" },
                  interactivePath: null,
                } },
                variants: { nodes: [{ id: "gid://shopify/ProductVariant/1", title: "Default", availableForSale: true, price: { amount: "29.00", currencyCode: "USD" } }] },
              },
              {
                id: "gid://shopify/Product/2", handle: "unsafe", title: "Unsafe", description: "Missing governance metadata",
                offerKind: { value: "artifact" }, commerceRoute: { value: "shopify_checkout" }, artifactEdition: null,
                variants: { nodes: [] },
              },
            ],
          },
        },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    };

    const catalog = await getStorefrontCatalog({
      SHOPIFY_STORE_DOMAIN: "example.myshopify.com",
      SHOPIFY_STOREFRONT_ACCESS_TOKEN: "test-token",
      STOREFRONT_PUBLIC_ENABLED: "true",
      STOREFRONT_CHECKOUT_ENABLED: "false",
    } as NodeJS.ProcessEnv, fetcher as typeof fetch);

    expect(catalog.products).toHaveLength(1);
    expect(catalog.products[0]?.variants[0]?.price.amount).toBe("29.00");
    expect(catalog.checkoutEnabled).toBe(false);
  });

  it("rejects unknown offer routing values", async () => {
    const fetcher = async () => new Response(JSON.stringify({ data: { products: { nodes: [{
      id: "1", handle: "bad", title: "Bad", description: "", featuredImage: null,
      offerKind: { value: "personality" }, commerceRoute: { value: "shopify_checkout" }, variants: { nodes: [] },
    }] } } }), { status: 200 });
    const catalog = await getStorefrontCatalog({
      SHOPIFY_STORE_DOMAIN: "example.myshopify.com", SHOPIFY_STOREFRONT_ACCESS_TOKEN: "token", STOREFRONT_PUBLIC_ENABLED: "true",
    } as NodeJS.ProcessEnv, fetcher as typeof fetch);
    expect(catalog.products).toEqual([]);
  });
});
