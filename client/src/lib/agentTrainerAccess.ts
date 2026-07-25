const DEFAULT_FOUNDER_ADMIN_EMAILS = ["keithsoyka@gmail.com"];

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function getFounderAdminEmails(): string[] {
  const configured = (import.meta.env.VITE_FOUNDER_ADMIN_EMAILS ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);

  return configured.length > 0 ? configured : DEFAULT_FOUNDER_ADMIN_EMAILS;
}

export function hasFounderTrainerControlPlaneAccess(input: {
  email?: string | null;
  isAdmin?: boolean;
}): boolean {
  if (input.isAdmin) {
    return true;
  }

  if (!input.email) {
    return false;
  }

  return getFounderAdminEmails().includes(normalizeEmail(input.email));
}

export function hasHostedAgentTrainerAccess(input: {
  isAdmin?: boolean;
  tier?: string | null;
  subscriptionStatus?: string | null;
}): boolean {
  if (input.isAdmin) {
    return true;
  }

  const tier = (input.tier ?? "").trim().toLowerCase();
  if (tier === "core" || tier === "pro" || tier === "enterprise") {
    return true;
  }

  const subscriptionStatus = (input.subscriptionStatus ?? "").trim().toLowerCase();
  return subscriptionStatus === "active" || subscriptionStatus === "trialing";
}

export function resolveHostedAgentTrainerPlan(input: {
  isAdmin?: boolean;
  tier?: string | null;
  subscriptionStatus?: string | null;
}): {
  runtimeTier: "SOLO_SPARK" | "STUDIO" | "ENTERPRISE";
  label: string;
  supportState: string;
} {
  if (input.isAdmin) {
    return {
      runtimeTier: "ENTERPRISE",
      label: "Founder / Admin Runtime",
      supportState: "Internal control plane + hosted subscriber preview",
    };
  }

  const tier = (input.tier ?? "").trim().toLowerCase();
  if (tier === "enterprise") {
    return {
      runtimeTier: "ENTERPRISE",
      label: "Enterprise Track",
      supportState: "Governance, audit, and rollout controls enabled",
    };
  }

  if (tier === "pro") {
    return {
      runtimeTier: "STUDIO",
      label: "Business Track",
      supportState: "Shared workspace, pack activation, and analytics access",
    };
  }

  if (tier === "core") {
    return {
      runtimeTier: "SOLO_SPARK",
      label: "Solo Track",
      supportState: "Single-operator hosted runtime",
    };
  }

  const subscriptionStatus = (input.subscriptionStatus ?? "").trim().toLowerCase();
  if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
    return {
      runtimeTier: "SOLO_SPARK",
      label: "Hosted Subscriber",
      supportState: "Hosted runtime enabled while billing is active",
    };
  }

  return {
    runtimeTier: "SOLO_SPARK",
    label: "Preview Mode",
    supportState: "Sign in and activate a hosted track to unlock the runtime",
  };
}
