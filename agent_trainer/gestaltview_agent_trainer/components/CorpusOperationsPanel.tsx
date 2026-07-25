import type { KitTierName } from "../config/tiers";
import { corpusOperations, type CorpusOperation } from "../config/trainerBlueprint";
import {
  Surface,
  Tag,
  autoGridStyle,
  glassCardStyle,
  glassNightCardStyle,
  kitFonts,
  subtleTextStyle
} from "./kitPrimitives";

interface CorpusOperationsPanelProps {
  tier: KitTierName;
}

const toneByKind: Record<CorpusOperation["kind"], "accent" | "soft" | "warm" | "night"> = {
  upload: "accent",
  import: "soft",
  export: "warm",
  download: "soft",
  automation: "night"
};

export function CorpusOperationsPanel({ tier }: CorpusOperationsPanelProps) {
  return (
    <Surface
      eyebrow="Import / Export"
      title="Operate the corpus without losing the thread"
      description={`Current tier: ${tier}. Each operation should make it obvious what artifact gets created next and how the operator moves from staging to a safe first ingest.`}
      footer={
        <div
          style={{
            paddingTop: 4,
            borderTop: "1px solid var(--gsvw-color-border-strong)",
            color: "var(--gsvw-color-text-secondary)",
            lineHeight: 1.6
          }}
        >
          Reference docs: <code style={{ fontFamily: kitFonts.mono }}>docs/CORPUS_INGEST_AUTOMATION.md</code> and{" "}
          <code style={{ fontFamily: kitFonts.mono }}>docs/VOICE_INTEGRATION.md</code>
        </div>
      }
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Tag tone="accent">BYOK</Tag>
        <Tag tone="soft">Manifest first</Tag>
        <Tag tone="warm">Auditable exports</Tag>
        <Tag tone="night">Zip-safe handoff</Tag>
      </div>

      <div style={autoGridStyle}>
        {corpusOperations.map((operation) => (
          <div key={operation.label} style={{ ...glassCardStyle, gap: 12 }}>
            <Tag tone={toneByKind[operation.kind]}>{operation.kind}</Tag>
            <div style={{ display: "grid", gap: 6 }}>
              <strong style={{ fontSize: "1.05rem" }}>{operation.label}</strong>
              <p style={subtleTextStyle}>{operation.summary}</p>
            </div>
            <code style={{ ...glassNightCardStyle, fontFamily: kitFonts.mono, fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {operation.command}
            </code>
            <div style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 700 }}>Output</span>
              <span style={subtleTextStyle}>{operation.artifact}</span>
            </div>
            <p style={subtleTextStyle}>{operation.note}</p>
          </div>
        ))}
      </div>
    </Surface>
  );
}
