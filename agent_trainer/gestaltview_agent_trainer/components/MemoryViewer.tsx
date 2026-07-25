import type { KitTierName } from "../config/tiers";
import { memoryWindows } from "../config/trainerBlueprint";
import {
  Surface,
  Tag,
  autoGridStyle,
  glassCardStyle,
  subtleTextStyle
} from "./kitPrimitives";

interface MemoryViewerProps {
  tier: KitTierName;
}

export function MemoryViewer({ tier }: MemoryViewerProps) {
  return (
    <Surface
      eyebrow="Memory Surface"
      title="Operational Continuity"
      description={`Current tier: ${tier}. Memory should preserve useful continuity while staying reviewable, bounded, and safe.`}
    >
      <div style={autoGridStyle}>
        {memoryWindows.map((window) => (
          <div key={window.label} style={glassCardStyle}>
            <Tag tone={window.label === "Unsafe to store" ? "warm" : "accent"}>
              {window.label}
            </Tag>
            <p style={subtleTextStyle}>{window.summary}</p>
          </div>
        ))}
      </div>
    </Surface>
  );
}
