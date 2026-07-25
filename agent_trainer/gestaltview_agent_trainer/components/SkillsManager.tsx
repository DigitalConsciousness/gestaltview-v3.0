import type { KitTierName } from "../config/tiers";
import { skillTracks } from "../config/trainerBlueprint";
import {
  Surface,
  Tag,
  autoGridStyle,
  glassCardStyle,
  subtleTextStyle
} from "./kitPrimitives";

interface SkillsManagerProps {
  tier: KitTierName;
}

export function SkillsManager({ tier }: SkillsManagerProps) {
  return (
    <Surface
      eyebrow="Skills Registry"
      title="Reusable Behavior Tracks"
      description={`Current tier: ${tier}. Skills should make the assistant more useful in the buyer's domain without exposing protected internal orchestration.`}
      accent="warm"
    >
      <div style={autoGridStyle}>
        {skillTracks.map((track) => (
          <div key={track.name} style={{ ...glassCardStyle, gap: 12 }}>
            <Tag tone={track.maturity === "ready" ? "accent" : track.maturity === "growing" ? "soft" : "warm"}>
              {track.maturity}
            </Tag>
            <strong style={{ fontSize: "1.05rem" }}>{track.name}</strong>
            <p style={subtleTextStyle}>{track.description}</p>
          </div>
        ))}
      </div>
    </Surface>
  );
}
