import type { KitTierName } from "../config/tiers";
import {
  Surface,
  Tag,
  codeChipStyle,
  glassCardStyle,
  subtleTextStyle
} from "./kitPrimitives";

interface ImportBoundaryPanelProps {
  tier: KitTierName;
}

const importRules = [
  "Only import buyer-owned or buyer-authorized material.",
  "Do not ship founder-specific corpus, prompts, or private archives.",
  "Start with small manifests and lane-aware titles.",
  "Treat secrets and regulated claims as out-of-band unless governance is explicit."
];

export function ImportBoundaryPanel({ tier }: ImportBoundaryPanelProps) {
  return (
    <Surface
      eyebrow="Import Boundary"
      title="User-Owned Data Only"
      description={`Current tier: ${tier}. The package should help operators load their own data cleanly while keeping GestaltView's internal corpus and logic out of scope.`}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Tag tone="accent">Buyer-owned sources</Tag>
        <Tag tone="warm">No founder data</Tag>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {importRules.map((rule) => (
          <div key={rule} style={{ ...glassCardStyle, padding: 14 }}>
            <p style={subtleTextStyle}>{rule}</p>
          </div>
        ))}
      </div>
      <code style={codeChipStyle}>
        npm run cli -- import-template ./buyer-import.template.json
      </code>
    </Surface>
  );
}
