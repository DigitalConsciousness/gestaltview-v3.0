import { z } from "zod";

export const STOREFRONT_API_VERSION = "2026-07";

export const offerKindSchema = z.enum([
  "orientation",
  "artifact",
  "studio",
  "self_serve_package",
  "custom_collaborator",
  "hosted_access",
]);

export const commerceRouteSchema = z.enum([
  "free_issue",
  "shopify_checkout",
  "gestaltview_requisition",
  "hosted_signup",
]);

export type StorefrontOfferKind = z.infer<typeof offerKindSchema>;
export type StorefrontCommerceRoute = z.infer<typeof commerceRouteSchema>;

export type StorefrontMoney = {
  amount: string;
  currencyCode: string;
};

export type StorefrontEdition = {
  name: string;
  version: string;
  formats: string[];
  license: string;
  updatePolicy: string;
  provenanceSummary: string;
  interactivePath: string | null;
};

export type StorefrontVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: StorefrontMoney;
};

export type StorefrontProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: { url: string; altText: string | null } | null;
  offerKind: StorefrontOfferKind;
  commerceRoute: StorefrontCommerceRoute;
  edition: StorefrontEdition | null;
  variants: StorefrontVariant[];
};

export type StorefrontCatalogResponse = {
  source: "shopify" | "launch_fallback";
  checkoutEnabled: boolean;
  products: StorefrontProduct[];
  notice?: string;
};

export const launchFallbackProducts: StorefrontProduct[] = [
  {
    id: "launch:orientation-dossier",
    handle: "enter-gestaltview-orientation-dossier",
    title: "Enter GestaltView: Orientation Dossier",
    description:
      "A public framework map, boundary statement, and guide to the artifact, collaborator, and living-framework lanes.",
    image: null,
    offerKind: "orientation",
    commerceRoute: "free_issue",
    edition: {
      name: "Orientation Dossier",
      version: "1.0.0",
      formats: ["Web"],
      license: "Free public orientation edition; internal canonical sources remain protected.",
      updatePolicy: "The public orientation may be corrected and reissued as the framework evolves.",
      provenanceSummary: "Public orientation authored from the GestaltView framework and manually reviewed.",
      interactivePath: "/orientation",
    },
    variants: [],
  },
  {
    id: "launch:custom-collaborator",
    handle: "custom-gestaltview-collaborator",
    title: "Custom GestaltView Collaborator",
    description:
      "A founder-reviewed, relationship-first collaborator requisition with explicit scope, boundaries, quote, and governed delivery.",
    image: null,
    offerKind: "custom_collaborator",
    commerceRoute: "gestaltview_requisition",
    edition: null,
    variants: [],
  },
];
