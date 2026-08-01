import {
  STOREFRONT_API_VERSION,
  commerceRouteSchema,
  launchFallbackProducts,
  offerKindSchema,
  type StorefrontCatalogResponse,
  type StorefrontEdition,
  type StorefrontProduct,
} from "../../shared/storefront/contracts.js";

const CATALOG_QUERY = `#graphql
  query GestaltViewStorefrontCatalog($first: Int!) {
    products(first: $first, sortKey: TITLE) {
      nodes {
        id
        handle
        title
        description
        featuredImage { url altText }
        offerKind: metafield(namespace: "$app", key: "offer_kind") { value }
        commerceRoute: metafield(namespace: "$app", key: "commerce_route") { value }
        artifactEdition: metafield(namespace: "$app", key: "artifact_edition") {
          reference {
            ... on Metaobject {
              name: field(key: "name") { value }
              version: field(key: "version") { value }
              formats: field(key: "formats") { value }
              license: field(key: "license") { value }
              updatePolicy: field(key: "update_policy") { value }
              provenanceSummary: field(key: "provenance_summary") { value }
              interactivePath: field(key: "interactive_path") { value }
            }
          }
        }
        variants(first: 20) {
          nodes { id title availableForSale price { amount currencyCode } }
        }
      }
    }
  }
`;

type ShopifyField = { value?: string | null } | null;
type ShopifyProductNode = Record<string, any>;

function readList(field: ShopifyField): string[] {
  if (!field?.value) return [];
  try {
    const value = JSON.parse(field.value);
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseEdition(node: ShopifyProductNode): StorefrontEdition | null {
  const reference = node.artifactEdition?.reference;
  if (!reference) return null;
  const edition = {
    name: reference.name?.value?.trim() ?? "",
    version: reference.version?.value?.trim() ?? "",
    formats: readList(reference.formats),
    license: reference.license?.value?.trim() ?? "",
    updatePolicy: reference.updatePolicy?.value?.trim() ?? "",
    provenanceSummary: reference.provenanceSummary?.value?.trim() ?? "",
    interactivePath: reference.interactivePath?.value?.trim() || null,
  };
  return edition.name && edition.version && edition.formats.length && edition.license &&
    edition.updatePolicy && edition.provenanceSummary ? edition : null;
}

function parseProduct(node: ShopifyProductNode): StorefrontProduct | null {
  const offerKind = offerKindSchema.safeParse(node.offerKind?.value);
  const commerceRoute = commerceRouteSchema.safeParse(node.commerceRoute?.value);
  if (!offerKind.success || !commerceRoute.success) return null;

  const edition = parseEdition(node);
  if (["orientation", "artifact", "studio", "self_serve_package"].includes(offerKind.data) && !edition) {
    return null;
  }

  return {
    id: String(node.id),
    handle: String(node.handle),
    title: String(node.title),
    description: String(node.description ?? ""),
    image: node.featuredImage
      ? { url: String(node.featuredImage.url), altText: node.featuredImage.altText ?? null }
      : null,
    offerKind: offerKind.data,
    commerceRoute: commerceRoute.data,
    edition,
    variants: Array.isArray(node.variants?.nodes)
      ? node.variants.nodes.map((variant: ShopifyProductNode) => ({
          id: String(variant.id),
          title: String(variant.title),
          availableForSale: Boolean(variant.availableForSale),
          price: {
            amount: String(variant.price?.amount ?? "0"),
            currencyCode: String(variant.price?.currencyCode ?? "USD"),
          },
        }))
      : [],
  };
}

export async function getStorefrontCatalog(
  env: NodeJS.ProcessEnv = process.env,
  fetcher: typeof fetch = fetch,
): Promise<StorefrontCatalogResponse> {
  const domain = env.SHOPIFY_STORE_DOMAIN?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const token = env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  const visible = env.STOREFRONT_PUBLIC_ENABLED === "true";

  if (!visible || !domain || !token) {
    return {
      source: "launch_fallback",
      checkoutEnabled: false,
      products: launchFallbackProducts,
      notice: visible
        ? "Artifact catalog connection is being commissioned. Orientation and collaborator requisitions remain available."
        : "The Artifact Exchange is in preview. Orientation and collaborator requisitions remain available.",
    };
  }

  const response = await fetcher(`https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query: CATALOG_QUERY, variables: { first: 50 } }),
  });
  if (!response.ok) throw new Error(`Shopify catalog request failed (${response.status})`);
  const payload = await response.json() as { data?: { products?: { nodes?: ShopifyProductNode[] } }; errors?: unknown[] };
  if (payload.errors?.length) throw new Error("Shopify catalog returned GraphQL errors");
  const products = (payload.data?.products?.nodes ?? []).map(parseProduct).filter((item): item is StorefrontProduct => item !== null);

  return {
    source: "shopify",
    checkoutEnabled: env.STOREFRONT_CHECKOUT_ENABLED === "true",
    products,
  };
}
