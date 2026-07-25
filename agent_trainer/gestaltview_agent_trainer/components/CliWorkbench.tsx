import type { KitTierName } from "../config/tiers";
import {
  Surface,
  Tag,
  codeChipStyle,
  glassNightCardStyle,
  nightSubtleTextStyle
} from "./kitPrimitives";

interface CliWorkbenchProps {
  tier: KitTierName;
}

const commandRows = [
  {
    command: "./gv.sh init business",
    summary: "Create a guided onboarding session and recommend the right commercial lane."
  },
  {
    command: "./gv.sh doctor .env.local",
    summary: "Validate environment state, provider posture, and setup blockers."
  },
  {
    command: "./gv.sh import manifest ./buyer-import.template.json",
    summary: "Run a manifest-driven corpus flow using the same task graph as the web wizard."
  },
  {
    command: "./gv.sh resume",
    summary: "Jump back to the next incomplete onboarding task with a machine-readable session log."
  }
];

export function CliWorkbench({ tier }: CliWorkbenchProps) {
  return (
    <Surface
      eyebrow="Operator CLI"
      title="Terminal Layer for Serious Operators"
      description={`Current tier: ${tier}. The package should support a CLI posture for devops-minded buyers who prefer inspectable commands over hidden UI-only flows.`}
      accent="night"
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Tag tone="accent">CLI-first friendly</Tag>
        <Tag tone="soft">Inspectable commands</Tag>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {commandRows.map((row) => (
          <div key={row.command} style={glassNightCardStyle}>
            <code style={codeChipStyle}>{row.command}</code>
            <p style={nightSubtleTextStyle}>{row.summary}</p>
          </div>
        ))}
      </div>
    </Surface>
  );
}
