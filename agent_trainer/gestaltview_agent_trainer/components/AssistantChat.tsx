import type { KitTierName } from "../config/tiers";
import { validationPrompts } from "../config/trainerBlueprint";
import {
  Surface,
  Tag,
  compactGridStyle,
  glassNightCardStyle,
  nightSubtleTextStyle
} from "./kitPrimitives";
import { TierGate } from "./TierGate";

interface AssistantChatProps {
  tier: KitTierName;
  kitName: string;
}

export function AssistantChat({ tier, kitName }: AssistantChatProps) {
  return (
    <TierGate tier={tier} feature="knowledgeManager">
      <Surface
        eyebrow="Validation Console"
        title={`${kitName} Proof Surface`}
        description="The assistant surface is where the operator validates whether the system is actually grounded in the buyer's world, rather than merely sounding plausible."
        accent="night"
      >
        <div style={compactGridStyle}>
          <div style={{ ...glassNightCardStyle, gap: 14 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Tag tone="accent">Grounded responses</Tag>
              <Tag tone="soft">Code + knowledge aware</Tag>
              <Tag tone="warm">Voice mode</Tag>
            </div>
            <p style={nightSubtleTextStyle}>
              Ask a high-stakes question that tests whether the trainer can weave
              together the right corpus lanes.
            </p>
            <textarea
              defaultValue="What does the current architecture suggest about our riskiest implementation bottleneck, and what missing documentation should we add next?"
              style={{
                width: "100%",
                minHeight: 140,
                borderRadius: 18,
                padding: 16,
                border: "1px solid color-mix(in srgb, var(--gsvw-color-accent-secondary) 28%, white)",
                background: "color-mix(in srgb, var(--gsvw-color-panel-glass) 18%, transparent)",
                color: "color-mix(in srgb, white 88%, var(--gsvw-color-accent-secondary))",
                fontFamily: "inherit",
                lineHeight: 1.6
              }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Tag tone="warm">Run validation</Tag>
              <Tag tone="soft">Inspect context stack</Tag>
              <Tag tone="soft">Start voice capture</Tag>
              <Tag tone="soft">Export transcript</Tag>
            </div>
          </div>

          <div style={{ ...glassNightCardStyle, gap: 14 }}>
            <strong style={{ fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Suggested validation prompts
            </strong>
            {validationPrompts.map((prompt) => (
              <div
                key={prompt}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  border: "1px solid color-mix(in srgb, var(--gsvw-color-accent-secondary) 24%, white)",
                  background: "color-mix(in srgb, var(--gsvw-color-panel-glass) 14%, transparent)",
                  lineHeight: 1.55
                }}
              >
                {prompt}
              </div>
            ))}
          </div>
        </div>
      </Surface>
    </TierGate>
  );
}
