import type { KitTierName } from "../config/tiers";
import { vocabularySignals } from "../config/trainerBlueprint";
import {
  Surface,
  Tag,
  autoGridStyle,
  glassCardStyle,
  subtleTextStyle
} from "./kitPrimitives";

interface PLKWizardProps {
  tier: KitTierName;
}

export function PLKWizard({ tier }: PLKWizardProps) {
  return (
    <Surface
      eyebrow="Vocabulary Profile"
      title="Alignment Without Exposing Internals"
      description={`Current tier: ${tier}. The vocabulary layer should make the system sound like it belongs in the buyer's world rather than like a generic assistant.`}
    >
      <div style={autoGridStyle}>
        {vocabularySignals.map((signal) => (
          <div key={signal.label} style={glassCardStyle}>
            <Tag tone="accent">{signal.label}</Tag>
            <p style={subtleTextStyle}>{signal.value}</p>
          </div>
        ))}
      </div>
    </Surface>
  );
}
