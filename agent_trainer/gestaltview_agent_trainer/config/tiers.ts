export type KitTierName =
  | "SOLO_SPARK"
  | "STUDIO"
  | "GROWTH"
  | "ENTERPRISE";

export interface TierDefinition {
  name: KitTierName;
  label: string;
  seats: number | "unlimited";
  fragmentLimit: number | "unlimited";
  memoryLimit: number | "unlimited";
  monthlyQueryLimit: number | "unlimited";
  priceMonthly: number | null;
  priceAnnual: number | null;
  notes: string[];
}

export const tierDefinitions: Record<KitTierName, TierDefinition> = {
  SOLO_SPARK: {
    name: "SOLO_SPARK",
    label: "Solo Spark",
    seats: 1,
    fragmentLimit: 100,
    memoryLimit: 50,
    monthlyQueryLimit: 500,
    priceMonthly: null,
    priceAnnual: 49,
    notes: [
      "Single-seat starter tier.",
      "Best for solo operators validating an initial corpus target."
    ]
  },
  STUDIO: {
    name: "STUDIO",
    label: "Studio",
    seats: 5,
    fragmentLimit: 1000,
    memoryLimit: 500,
    monthlyQueryLimit: 5000,
    priceMonthly: 149,
    priceAnnual: 999,
    notes: [
      "Best fit for consultants, agencies, and small teams.",
      "Eligible for the bootstrap discount program."
    ]
  },
  GROWTH: {
    name: "GROWTH",
    label: "Growth",
    seats: 25,
    fragmentLimit: 10000,
    memoryLimit: 5000,
    monthlyQueryLimit: 50000,
    priceMonthly: 449,
    priceAnnual: 3499,
    notes: [
      "Multi-team deployment with broader knowledge and analytics needs."
    ]
  },
  ENTERPRISE: {
    name: "ENTERPRISE",
    label: "Enterprise",
    seats: "unlimited",
    fragmentLimit: "unlimited",
    memoryLimit: "unlimited",
    monthlyQueryLimit: "unlimited",
    priceMonthly: null,
    priceAnnual: null,
    notes: [
      "Custom licensing, governance, and support model."
    ]
  }
};

export function getTierDefinition(tier: KitTierName): TierDefinition {
  return tierDefinitions[tier];
}
