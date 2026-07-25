import type { ReactNode } from "react";
import { tierFeatures } from "../config/features";
import type { KitTierName } from "../config/tiers";
import { Surface } from "./kitPrimitives";

interface TierGateProps {
  tier: KitTierName;
  feature: keyof (typeof tierFeatures)[KitTierName];
  children: ReactNode;
  fallback?: ReactNode;
}

export function TierGate({ tier, feature, children, fallback }: TierGateProps) {
  if (tierFeatures[tier][feature]) {
    return <>{children}</>;
  }

  return (
    <>
      {fallback ?? (
        <Surface
          eyebrow="Tier Gate"
          title="Feature not enabled"
          description={`The ${feature} surface is not available for the ${tier} tier in this package shape.`}
          accent="warm"
        >
          <span>This is where an upgrade prompt or alternate workflow would live.</span>
        </Surface>
      )}
    </>
  );
}
