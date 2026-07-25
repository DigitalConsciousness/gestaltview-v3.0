export type BillingPlan = "core" | "pro" | "enterprise";

export const BILLING_PLAN_ORDER: BillingPlan[] = ["core", "pro", "enterprise"];

export type BillingPlanCard = {
  id: BillingPlan;
  title: string;
  summary: string;
  badge?: string;
  pricingHref: string;
  loginCopy: string;
};

export const BILLING_PLAN_CARDS: BillingPlanCard[] = [
  {
    id: "core",
    title: "GestaltView Core",
    summary: "The foundation tier for people who want Billy, memory, and the room-based workspace.",
    pricingHref: "/pricing?plan=core",
    loginCopy: "Best for returning users who want the basic lane unlocked before signing in.",
  },
  {
    id: "pro",
    title: "GestaltView Pro",
    summary: "The full working surface with deeper memory, more domain lanes, and advanced responses.",
    badge: "Most complete",
    pricingHref: "/pricing?plan=pro",
    loginCopy: "Best for users who already know they want the full operating surface.",
  },
  {
    id: "enterprise",
    title: "Enterprise",
    summary: "White-label deployment, team onboarding, and custom implementation support.",
    pricingHref: "/pricing?plan=enterprise",
    loginCopy: "Best for teams that need a human follow-up instead of self-serve checkout.",
  },
];

export function parseBillingPlan(value: string | null | undefined): BillingPlan | null {
  if (value === "core" || value === "pro" || value === "enterprise") {
    return value;
  }

  return null;
}

export function readBillingPlanFromSearch(search: string): BillingPlan | null {
  try {
    return parseBillingPlan(new URLSearchParams(search).get("plan"));
  } catch {
    return null;
  }
}

