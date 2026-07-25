import { buildThemeFromBrandColor, exportThemeProfile, themePresets, validateThemeAccessibility } from "../config/themeEngine";
import type { KitTierName } from "../config/tiers";
import {
  Surface,
  Tag,
  autoGridStyle,
  glassCardStyle,
  glassNightCardStyle,
  subtleTextStyle
} from "./kitPrimitives";

interface ThemeStudioProps {
  tier: KitTierName;
}

const previewTheme = buildThemeFromBrandColor("Buyer Brand", "#145f8f", "business");

export function ThemeStudio({ tier }: ThemeStudioProps) {
  const accessibility = validateThemeAccessibility(previewTheme.tokens);

  return (
    <Surface
      eyebrow="Theme Engine"
      title="Tokenized theme profiles"
      description={`Current tier: ${tier}. Themes are first-class buyer assets: presets, brand-color generation, and import/export JSON without source edits.`}
    >
      <div style={autoGridStyle}>
        {themePresets.map((preset) => (
          <div key={preset.id} style={glassCardStyle}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Tag tone="accent">{preset.label}</Tag>
              {preset.bestFor.map((segment) => (
                <Tag key={segment} tone="soft">
                  {segment}
                </Tag>
              ))}
            </div>
            <div
              style={{
                height: 92,
                borderRadius: 18,
                background: `
                  radial-gradient(circle at 15% 20%, ${preset.tokens.gradient.heroA}, transparent 40%),
                  radial-gradient(circle at 85% 25%, ${preset.tokens.gradient.heroB}, transparent 42%),
                  linear-gradient(180deg, ${preset.tokens.color.bgBase}, ${preset.tokens.color.bgElevated})
                `,
                border: `1px solid ${preset.tokens.color.borderSoft}`
              }}
            />
            <p style={subtleTextStyle}>{preset.description}</p>
          </div>
        ))}
      </div>

      <div style={glassCardStyle}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Tag tone="warm">Brand-derived theme</Tag>
          <Tag tone={accessibility.passes ? "accent" : "warm"}>
            {accessibility.passes ? "Accessibility pass" : "Needs adjustment"}
          </Tag>
        </div>
        <p style={subtleTextStyle}>
          Buyers can generate a theme from a single brand color, then export the resolved token set as JSON.
        </p>
        <pre
          style={{
            ...glassNightCardStyle,
            margin: 0,
            overflow: "auto",
            fontSize: 12
          }}
        >
          {exportThemeProfile(previewTheme)}
        </pre>
      </div>
    </Surface>
  );
}
