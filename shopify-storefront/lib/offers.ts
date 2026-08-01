import type { StorefrontProduct } from "./storefront";

export type IntentId =
  | "orient"
  | "preserve"
  | "continuity"
  | "create"
  | "embodiment"
  | "evidence"
  | "focused_lane"
  | "custom";

export type OfferPresentation = {
  manifestVersion: "1.0.0";
  family: string;
  intents: IntentId[];
  plainPromise: string;
  enters: string[];
  happens: string[];
  dispenses: string[];
  firstReceipt: string;
  exclusions: string[];
  proofLabel: string;
  proofHref: string;
  activationMode: "download" | "runtime" | "human_handoff" | "hybrid";
  activationTime: string;
  configuration: Array<{
    id: "use" | "format" | "timing";
    label: string;
    options: string[];
  }>;
  voiceProfile: "cheerful_infrastructure";
};

export const intents: Array<{ id: IntentId; label: string; detail: string }> = [
  { id: "orient", label: "Understand GestaltView", detail: "Get the map before selecting machinery." },
  { id: "preserve", label: "Preserve unfinished work", detail: "Give scattered ideas a reliable place to wait." },
  { id: "continuity", label: "Work with Billy and continuity", detail: "Begin a governed thread that can be returned to." },
  { id: "create", label: "Build or package a project", detail: "Turn intent into inspectable proposed work." },
  { id: "embodiment", label: "Shape a collaboration", detail: "Define role, voice, limits, and governance." },
  { id: "evidence", label: "Assemble evidence", detail: "Organize claims, chronology, provenance, and review." },
  { id: "focused_lane", label: "Explore a focused lane", detail: "Find a bounded entry for a particular lived context." },
  { id: "custom", label: "Request a custom partnership", detail: "Bring work that does not belong in a standard compartment." },
];

const orientation: OfferPresentation = {
  manifestVersion: "1.0.0",
  family: "Field Notes",
  intents: ["orient", "focused_lane"],
  plainPromise: "A usable map of GestaltView, its boundaries, and the next doors that actually open.",
  enters: ["Your attention", "No account or source material"],
  happens: ["You inspect the framework, its limits, and public examples"],
  dispenses: ["Accessible web orientation", "Clear routes into artifacts, collaboration, or runtime"],
  firstReceipt: "The orientation opens immediately. Nothing is silently retained.",
  exclusions: ["No personalized interpretation", "No durable continuity", "No purchase required"],
  proofLabel: "Open the public orientation",
  proofHref: "/orientation",
  activationMode: "download",
  activationTime: "Immediate",
  configuration: [],
  voiceProfile: "cheerful_infrastructure",
};

const artifact: OfferPresentation = {
  manifestVersion: "1.0.0",
  family: "Field Notes",
  intents: ["orient", "preserve", "create", "evidence"],
  plainPromise: "A finished, versioned artifact with provenance and a clearly stated use boundary.",
  enters: ["A product choice", "Only the checkout details Shopify requires"],
  happens: ["Shopify verifies payment", "GestaltView issues the bounded edition named here"],
  dispenses: ["The listed durable formats", "Edition, license, update, and provenance record"],
  firstReceipt: "Shopify confirms the order; delivery follows the terms shown for this edition.",
  exclusions: ["No hosted continuity unless explicitly listed", "No automatic source-material import"],
  proofLabel: "Inspect edition evidence",
  proofHref: "#proof",
  activationMode: "download",
  activationTime: "Shown with the edition",
  configuration: [
    { id: "use", label: "Use", options: ["Individual", "Collaborative"] },
    { id: "format", label: "Preferred format", options: ["Best available", "Accessible HTML", "PDF"] },
  ],
  voiceProfile: "cheerful_infrastructure",
};

const custom: OfferPresentation = {
  manifestVersion: "1.0.0",
  family: "Custom Systems Counter",
  intents: ["create", "embodiment", "evidence", "focused_lane", "custom"],
  plainPromise: "A founder-reviewed working relationship with scope, boundaries, and price established before payment.",
  enters: ["A concise description of the work", "Boundaries, timing, and source-material expectations"],
  happens: ["The request is reviewed", "A proposal is separated from any later execution"],
  dispenses: ["A scope decision", "If appropriate, a quote and governed delivery plan"],
  firstReceipt: "A requisition receipt confirms what was submitted and what happens next.",
  exclusions: ["No automatic acceptance", "No payment before scope review", "No silent retention beyond stated policy"],
  proofLabel: "Inspect the requisition boundary",
  proofHref: "/collaborator-requisition",
  activationMode: "human_handoff",
  activationTime: "Founder-scoped",
  configuration: [],
  voiceProfile: "cheerful_infrastructure",
};

export function presentationFor(product: StorefrontProduct): OfferPresentation {
  if (product.handle === "continuity-starter") return { ...artifact, family: "Continuity Starter", intents: ["preserve", "continuity"], activationMode: "runtime", activationTime: "Not yet commissioned" };
  if (product.handle === "creation-station") return { ...artifact, family: "Creation Station", intents: ["preserve", "create"], activationMode: "hybrid", activationTime: "Not yet commissioned" };
  if (product.handle === "embodiment-workshop") return { ...custom, family: "Embodiment Workshop", intents: ["embodiment", "custom"], activationMode: "human_handoff", activationTime: "Not yet commissioned" };
  if (product.handle === "evidence-diligence-station") return { ...artifact, family: "Evidence & Diligence Station", intents: ["evidence", "custom"], activationMode: "hybrid", activationTime: "Not yet commissioned" };
  if (product.commerceRoute === "gestaltview_requisition" || product.offerKind === "custom_collaborator") return custom;
  if (product.offerKind === "orientation" || product.commerceRoute === "free_issue") return orientation;
  return {
    ...artifact,
    family: product.offerKind === "studio" ? "Creation Station" : product.offerKind === "hosted_access" ? "Continuity Starter" : artifact.family,
    activationMode: product.offerKind === "hosted_access" ? "runtime" : artifact.activationMode,
  };
}
