import type { KitTierName } from "../config/tiers";
import {
  voiceIntegrationChecklist,
  voiceReadinessSignals,
  type VoiceReadinessSignal
} from "../config/trainerBlueprint";
import {
  Surface,
  Tag,
  autoGridStyle,
  glassNightCardStyle,
  nightSubtleTextStyle
} from "./kitPrimitives";

interface VoiceIntegrationPanelProps {
  tier: KitTierName;
}

const toneByState: Record<VoiceReadinessSignal["state"], "accent" | "warm" | "soft"> = {
  ready: "accent",
  "buyer-owned": "soft",
  "wire-next": "warm"
};

export function VoiceIntegrationPanel({ tier }: VoiceIntegrationPanelProps) {
  return (
    <Surface
      eyebrow="Voice Runtime"
      title="Wire voice in a buyer-owned way"
      description={`Current tier: ${tier}. Voice should feel production-minded: buyer-owned keys, explicit transcript handling, and a clear distinction between what is already scaffolded and what still needs runtime wiring.`}
      accent="night"
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Tag tone="accent">Capture</Tag>
        <Tag tone="soft">Transcribe</Tag>
        <Tag tone="warm">Return audio</Tag>
        <Tag tone="soft">Export transcript</Tag>
      </div>

      <div style={autoGridStyle}>
        {voiceReadinessSignals.map((signal) => (
          <div key={signal.label} style={{ ...glassNightCardStyle, gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
              <strong style={{ fontSize: "1rem" }}>{signal.label}</strong>
              <Tag tone={toneByState[signal.state]}>{signal.state}</Tag>
            </div>
            <p style={nightSubtleTextStyle}>{signal.detail}</p>
            <span style={{ color: "color-mix(in srgb, white 62%, var(--gsvw-color-accent-secondary))", lineHeight: 1.5 }}>
              Owner: {signal.owner}
            </span>
          </div>
        ))}
      </div>

      <div style={{ ...glassNightCardStyle, gap: 12 }}>
        <strong style={{ fontSize: "1.05rem" }}>Production checklist</strong>
        {voiceIntegrationChecklist.map((item, index) => (
          <div
            key={item}
            style={{
              display: "grid",
              gridTemplateColumns: "28px 1fr",
              gap: 12,
              alignItems: "start"
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: 999,
                background: "color-mix(in srgb, var(--gsvw-color-accent-primary) 24%, transparent)",
                color: "color-mix(in srgb, var(--gsvw-color-accent-secondary) 84%, white)",
                fontWeight: 700
              }}
            >
              {index + 1}
            </span>
            <span style={{ color: "color-mix(in srgb, white 84%, var(--gsvw-color-accent-secondary))", lineHeight: 1.6 }}>{item}</span>
          </div>
        ))}
      </div>
    </Surface>
  );
}
