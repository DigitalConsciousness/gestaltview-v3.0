import type { KitTierName } from "../config/tiers";
import { operatorPacks } from "../config/operatorPacks";
import { previewStarterPacks } from "../api/packs";
import {
  Surface,
  Tag,
  autoGridStyle,
  codeChipStyle,
  glassCardStyle,
  subtleTextStyle
} from "./kitPrimitives";

interface PackLibraryProps {
  tier: KitTierName;
}

export function PackLibrary({ tier }: PackLibraryProps) {
  const previews = previewStarterPacks();

  return (
    <Surface
      eyebrow="Starter Packs"
      title="Preloadable Skills, Tools, and Agent Sources"
      description={`Current tier: ${tier}. Buyers should be able to pull from agnostic starter packs instead of hand-authoring every capability from zero.`}
    >
      <div style={autoGridStyle}>
        {operatorPacks.map((pack) => {
          const preview = previews.find((entry) => entry.slug === pack.slug);

          return (
            <div key={pack.slug} style={{ ...glassCardStyle, gap: 12 }}>
              <Tag tone={pack.kind === "tools" ? "warm" : "accent"}>{pack.kind}</Tag>
              <strong style={{ fontSize: "1.05rem" }}>{pack.title}</strong>
              <p style={subtleTextStyle}>{pack.summary}</p>
              <div style={{ display: "grid", gap: 6 }}>
                {pack.includes.map((item) => (
                  <span key={item} style={subtleTextStyle}>
                    {item}
                  </span>
                ))}
              </div>
              <p style={subtleTextStyle}>Best for: {pack.bestFor}</p>
              {preview ? (
                <div style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>Applying this pack seeds:</span>
                  <span style={subtleTextStyle}>
                    skills: {preview.generatedSkills.length || 0} • memory: {preview.generatedMemoryKeys.length || 0}
                  </span>
                  <span style={subtleTextStyle}>
                    source bundles: {preview.recommendedSourceBundles.join(", ") || "none"}
                  </span>
                </div>
              ) : null}
              <code style={codeChipStyle}>npm run cli -- packs</code>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}
