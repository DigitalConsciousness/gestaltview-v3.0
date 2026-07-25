import type { KitTierName } from "../config/tiers";
import {
  corpusContainerBlueprint,
  corpusReviewChecklist,
  corpusTargets
} from "../config/trainerBlueprint";
import {
  Surface,
  Tag,
  actionChipStyle,
  autoGridStyle,
  glassCardStyle,
  ProgressTrack,
  subtleTextStyle
} from "./kitPrimitives";

interface KnowledgeUploaderProps {
  tier: KitTierName;
}

export function KnowledgeUploader({ tier }: KnowledgeUploaderProps) {
  return (
    <Surface
      eyebrow="Corpus Command"
      title="Stage the corpus before you ingest it"
      description={`Current tier: ${tier}. The operator should see where repo exports go, where reviewed files go next, and which lane needs attention before any live import.`}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <span style={actionChipStyle}>Stage repo exports</span>
        <span style={actionChipStyle}>Review first batch</span>
        <span style={actionChipStyle}>Import manifest</span>
        <span style={actionChipStyle}>Dry-run first</span>
      </div>
      <div style={autoGridStyle}>
        {corpusContainerBlueprint.slice(0, 4).map((zone) => (
          <div key={zone.path} style={{ ...glassCardStyle, gap: 14 }}>
            <Tag tone={zone.path.startsWith("incoming") ? "soft" : "warm"}>{zone.label}</Tag>
            <div style={{ display: "grid", gap: 6 }}>
              <strong style={{ fontSize: "1.05rem" }}>{zone.path}</strong>
              <p style={subtleTextStyle}>{zone.summary}</p>
              <p style={subtleTextStyle}>{zone.bestFor.join(" • ")}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={autoGridStyle}>
        {corpusTargets.map((target) => (
          <div key={target.lane} style={{ ...glassCardStyle, gap: 14 }}>
            <Tag tone={target.lane === "product" ? "warm" : "accent"}>
              {target.shortLabel}
            </Tag>
            <div style={{ display: "grid", gap: 6 }}>
              <strong style={{ fontSize: "1.05rem" }}>{target.label}</strong>
              <p style={subtleTextStyle}>{target.purpose}</p>
              <p style={subtleTextStyle}>{target.summary}</p>
            </div>
            <ProgressTrack
              label={target.fragmentCountLabel}
              value={target.readinessPercent}
              tone={target.lane === "product" ? "warm" : "accent"}
            />
            <div style={{ display: "grid", gap: 8 }}>
              <span style={{ fontWeight: 700 }}>Best uploads</span>
              <span style={subtleTextStyle}>{target.uploads.join(" • ")}</span>
              <span style={subtleTextStyle}>{target.resultingAssistant}</span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <span style={{ fontWeight: 700 }}>Missing inputs</span>
              {target.missingInputs.map((item) => (
                <span key={item} style={subtleTextStyle}>
                  {item}
                </span>
              ))}
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 700 }}>Next best action</span>
              <p style={subtleTextStyle}>{target.nextBestAction}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={glassCardStyle}>
        <Tag tone="accent">Before import</Tag>
        <div style={{ display: "grid", gap: 8 }}>
          {corpusReviewChecklist.map((item) => (
            <span key={item} style={subtleTextStyle}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </Surface>
  );
}
