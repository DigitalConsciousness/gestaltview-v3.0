export const STOREFRONT_API_VERSION = "2026-07";

export type OfferKind =
  | "orientation"
  | "artifact"
  | "service"
  | "studio"
  | "self_serve_package"
  | "custom_collaborator"
  | "hosted_access";

export type CommerceRoute =
  | "free_issue"
  | "shopify_checkout"
  | "gestaltview_requisition"
  | "hosted_signup";

export type StorefrontProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  offerKind: OfferKind;
  commerceRoute: CommerceRoute;
  image: { url: string; altText: string | null } | null;
  edition: {
    name: string;
    version: string;
    formats: string[];
    license: string;
    updatePolicy: string;
    provenanceSummary: string;
    interactivePath: string | null;
  } | null;
  variants: Array<{
    id: string;
    title: string;
    availableForSale: boolean;
    price: { amount: string; currencyCode: string };
  }>;
};

export type StorefrontCatalog = {
  source: "shopify" | "launch_fallback";
  checkoutEnabled: boolean;
  products: StorefrontProduct[];
  notice?: string;
};

const offerKinds = new Set<OfferKind>([
  "orientation",
  "artifact",
  "service",
  "studio",
  "self_serve_package",
  "custom_collaborator",
  "hosted_access",
]);

const commerceRoutes = new Set<CommerceRoute>([
  "free_issue",
  "shopify_checkout",
  "gestaltview_requisition",
  "hosted_signup",
]);

export const sprintProduct: StorefrontProduct = {
  id: "gid://shopify/Product/8985408208975",
  handle: "project-convergence-sprint",
  title: "GestaltView Project Convergence Sprint",
  description: "A founder-led, evidence-backed convergence pass for one scattered project.",
  offerKind: "service",
  commerceRoute: "shopify_checkout",
  image: null,
  edition: null,
  variants: [{
    id: "gid://shopify/ProductVariant/46345021718607",
    title: "Founding rate",
    availableForSale: true,
    price: { amount: "495.00", currencyCode: "USD" },
  }],
};

const launchFallback: StorefrontProduct[] = [
  sprintProduct,
  {
    id: "launch:orientation-dossier",
    handle: "enter-gestaltview-orientation-dossier",
    title: "Enter GestaltView: Orientation Dossier",
    description:
      "A public framework map, boundary statement, and guide to artifacts, collaborators, and the living framework.",
    offerKind: "orientation",
    commerceRoute: "free_issue",
    image: null,
    edition: {
      name: "Orientation Dossier",
      version: "1.0.0",
      formats: ["Accessible web edition"],
      license: "Free public orientation; internal canonical sources remain protected.",
      updatePolicy: "Corrections and public framework updates may be reissued.",
      provenanceSummary:
        "Public orientation authored from the GestaltView framework and manually reviewed.",
      interactivePath: "/orientation",
    },
    variants: [],
  },
  {
    id: "launch:custom-collaborator",
    handle: "custom-gestaltview-collaborator",
    title: "Custom GestaltView Collaborator",
    description:
      "A founder-reviewed working relationship with explicit scope, boundaries, quote, and governed delivery.",
    offerKind: "custom_collaborator",
    commerceRoute: "gestaltview_requisition",
    image: null,
    edition: null,
    variants: [],
  },
  {
    id: "launch:continuity-starter",
    handle: "continuity-starter",
    title: "Continuity Starter",
    description: "A bounded entry into capture, Billy, and preserved threads. Publication waits for the full entitlement and consent bridge.",
    offerKind: "hosted_access",
    commerceRoute: "hosted_signup",
    image: null,
    edition: null,
    variants: [],
  },
  {
    id: "launch:creation-station",
    handle: "creation-station",
    title: "Creation Station",
    description: "Structured intake, blueprinting, and inspectable artifact proposals with execution kept behind approval.",
    offerKind: "studio",
    commerceRoute: "hosted_signup",
    image: null,
    edition: null,
    variants: [],
  },
  {
    id: "launch:embodiment-workshop",
    handle: "embodiment-workshop",
    title: "Embodiment Workshop",
    description: "A scoped role, voice, capability, refusal, provenance, and governance package—not a digital identity for sale.",
    offerKind: "custom_collaborator",
    commerceRoute: "hosted_signup",
    image: null,
    edition: null,
    variants: [],
  },
  {
    id: "launch:evidence-diligence",
    handle: "evidence-diligence-station",
    title: "Evidence & Diligence Station",
    description: "Chronology, claims, provenance, unresolved questions, and audit-ready receipts with certainty kept calibrated.",
    offerKind: "self_serve_package",
    commerceRoute: "hosted_signup",
    image: null,
    edition: null,
    variants: [],
  },
];

const catalogQuery = `#graphql
  query GestaltViewStorefrontCatalog($first: Int!) {
    products(first: $first, sortKey: TITLE) {
      nodes {
        id handle title description
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

type ShopifyNode = Record<string, unknown>;
function object(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function fieldValue(value: unknown): string {
  return String(object(value)?.value ?? "").trim();
}

function parseFormats(value: unknown): string[] {
  try {
    const parsed = JSON.parse(fieldValue(value));
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function parseProduct(node: ShopifyNode): StorefrontProduct | null {
  const offerKind = fieldValue(node.offerKind) as OfferKind;
  const commerceRoute = fieldValue(node.commerceRoute) as CommerceRoute;
  if (!offerKinds.has(offerKind) || !commerceRoutes.has(commerceRoute)) return null;

  const reference = object(object(node.artifactEdition)?.reference);
  const edition = reference
    ? {
        name: fieldValue(reference.name),
        version: fieldValue(reference.version),
        formats: parseFormats(reference.formats),
        license: fieldValue(reference.license),
        updatePolicy: fieldValue(reference.updatePolicy),
        provenanceSummary: fieldValue(reference.provenanceSummary),
        interactivePath: fieldValue(reference.interactivePath) || null,
      }
    : null;
  const editionRequired = ["orientation", "artifact", "studio", "self_serve_package"].includes(offerKind);
  if (
    editionRequired &&
    (!edition || !edition.name || !edition.version || !edition.formats.length ||
      !edition.license || !edition.updatePolicy || !edition.provenanceSummary)
  ) return null;

  const featuredImage = object(node.featuredImage);
  const variants = object(node.variants)?.nodes;

  return {
    id: String(node.id),
    handle: String(node.handle),
    title: String(node.title),
    description: String(node.description ?? ""),
    offerKind,
    commerceRoute,
    image: featuredImage
      ? { url: String(featuredImage.url), altText: featuredImage.altText ? String(featuredImage.altText) : null }
      : null,
    edition,
    variants: Array.isArray(variants)
      ? variants.map((entry) => {
          const variant = object(entry) ?? {};
          const price = object(variant.price) ?? {};
          return {
            id: String(variant.id),
            title: String(variant.title),
            availableForSale: Boolean(variant.availableForSale),
            price: { amount: String(price.amount ?? "0"), currencyCode: String(price.currencyCode ?? "USD") },
          };
        })
      : [],
  };
}

export function primaryAppUrl(path = "/"): string {
  const origin = (process.env.GESTALTVIEW_APP_URL || "https://gestaltview-di-gsvw.vercel.app").replace(/\/$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function getStorefrontCatalog(): Promise<StorefrontCatalog> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  const visible = process.env.STOREFRONT_PUBLIC_ENABLED === "true";

  if (!visible || !domain || !token) {
    return {
      source: "launch_fallback",
      checkoutEnabled: false,
      products: launchFallback,
      notice: visible
        ? "The live artifact shelf is being commissioned. Safe launch paths remain available."
        : "Artifact Exchange preview: paid issuance is not yet open.",
    };
  }

  try {
    const response = await fetch(`https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query: catalogQuery, variables: { first: 50 } }),
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error(`catalog_http_${response.status}`);
    const payload = (await response.json()) as {
      data?: { products?: { nodes?: ShopifyNode[] } };
      errors?: unknown[];
    };
    if (payload.errors?.length) throw new Error("catalog_graphql_error");
    const products = (payload.data?.products?.nodes ?? [])
      .map(parseProduct)
      .filter((product): product is StorefrontProduct => product !== null);
    return {
      source: "shopify",
      checkoutEnabled: process.env.STOREFRONT_CHECKOUT_ENABLED === "true",
      products: products.some((product) => product.handle === sprintProduct.handle)
        ? products
        : [sprintProduct, ...products],
    };
  } catch (error) {
    console.error("[shopify-storefront] catalog unavailable", error instanceof Error ? error.message : "unknown");
    return {
      source: "launch_fallback",
      checkoutEnabled: false,
      products: launchFallback,
      notice: "The live artifact shelf could not be reached. Safe launch paths are shown instead.",
    };
  }
}

const cartMutation = `#graphql
  mutation GestaltViewCartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { id checkoutUrl }
      userErrors { field message }
      warnings { message }
    }
  }
`;

export async function createStorefrontCart(input: {
  variantId: string;
  attributes: Array<{ key: string; value: string }>;
}): Promise<{ checkoutUrl: string }> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  if (!domain || !token) throw new Error("shopify_not_configured");
  const response = await fetch(`https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
    body: JSON.stringify({
      query: cartMutation,
      variables: { input: { lines: [{ merchandiseId: input.variantId, quantity: 1, attributes: input.attributes }] } },
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`cart_http_${response.status}`);
  const payload = (await response.json()) as {
    data?: { cartCreate?: { cart?: { checkoutUrl?: string }; userErrors?: Array<{ message?: string }> } };
    errors?: unknown[];
  };
  const result = payload.data?.cartCreate;
  if (payload.errors?.length || result?.userErrors?.length || !result?.cart?.checkoutUrl) throw new Error("cart_graphql_error");
  return { checkoutUrl: result.cart.checkoutUrl };
}

export function formatProductPrice(product: StorefrontProduct): string {
  const price = product.variants[0]?.price;
  if (!price) return product.commerceRoute === "free_issue" ? "Free issue" : "Founder scoped";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currencyCode,
  }).format(Number(price.amount));
}
