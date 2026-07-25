import type { KitTierName } from "../config/tiers";
import { sourceBundles } from "../config/sourceBundles";
import {
  Surface,
  Tag,
  autoGridStyle,
  glassCardStyle,
  subtleTextStyle
} from "./kitPrimitives";

interface SourceBundleStudioProps {
  tier: KitTierName;
}

export function SourceBundleStudio({ tier }: SourceBundleStudioProps) {
  return (
    <Surface
      eyebrow="Source Bundles"
      title="Study Before You Write"
      description={`Current tier: ${tier}. Source bundles let buyers pull from reusable, lane-aware reference structures before they start authoring agent behavior from scratch.`}
      accent="warm"
    >
      <div style={autoGridStyle}>
        {sourceBundles.map((bundle) => (
          <div key={bundle.slug} style={{ ...glassCardStyle, gap: 12 }}>
            <Tag tone={bundle.lane === "product" ? "warm" : "accent"}>{bundle.lane}</Tag>
            <strong style={{ fontSize: "1.05rem" }}>{bundle.title}</strong>
            <p style={subtleTextStyle}>{bundle.summary}</p>
            <div style={{ display: "grid", gap: 6 }}>
              {bundle.includes.map((item) => (
                <span key={item} style={subtleTextStyle}>
                  {item}
                </span>
              ))}
            </div>
            <p style={subtleTextStyle}>Best for: {bundle.bestFor}</p>
          </div>
        ))}
      </div>
    </Surface>
  );
}
