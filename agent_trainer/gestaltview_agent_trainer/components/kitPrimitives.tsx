import type { CSSProperties, ReactNode } from "react";
import {
  buildBackdropBackground,
  buildThemeCssVariables,
  defaultThemePreset,
  resolveThemeProfile,
  themeVars,
  type ThemeProfile
} from "../config/themeEngine";

export const kitPalette = {
  bgBase: themeVars.bgBase,
  bgElevated: themeVars.bgElevated,
  panel: themeVars.panelGlass,
  panelStrong: themeVars.panelGlassStrong,
  border: themeVars.borderSoft,
  borderStrong: themeVars.borderStrong,
  ink: themeVars.textPrimary,
  inkSoft: themeVars.textSecondary,
  accent: themeVars.accentPrimary,
  accentSoft: `color-mix(in srgb, ${themeVars.accentPrimary} 18%, white)`,
  accentMist: `color-mix(in srgb, ${themeVars.accentSecondary} 12%, white)`,
  ember: themeVars.warning,
  emberSoft: `color-mix(in srgb, ${themeVars.warning} 16%, white)`,
  night: `color-mix(in srgb, ${themeVars.bgBase} 82%, black)`,
  nightSoft: `color-mix(in srgb, ${themeVars.bgBase} 72%, ${themeVars.accentPrimary})`
} as const;

export const kitFonts = {
  heading: themeVars.fontHeading,
  body: themeVars.fontBody,
  mono: themeVars.fontMono
} as const;

export const pageStyle: CSSProperties = {
  position: "relative",
  minHeight: "100vh",
  padding: 32,
  overflow: "hidden",
  color: kitPalette.ink,
  fontFamily: kitFonts.body
};

export const sectionGridStyle: CSSProperties = {
  display: "grid",
  gap: 24
};

export const autoGridStyle: CSSProperties = {
  display: "grid",
  gap: 20,
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
};

export const compactGridStyle: CSSProperties = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))"
};

export const glassCardStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  padding: 18,
  borderRadius: themeVars.radiusMd,
  background: kitPalette.panel,
  border: `1px solid ${kitPalette.borderStrong}`,
  boxShadow: themeVars.shadowSoft,
  backdropFilter: `blur(${themeVars.blurSm}) saturate(${themeVars.saturation})`
};

export const glassCardStrongStyle: CSSProperties = {
  ...glassCardStyle,
  background: kitPalette.panelStrong
};

export const glassNightCardStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  padding: 18,
  borderRadius: themeVars.radiusMd,
  background: `linear-gradient(180deg, ${kitPalette.night}, ${kitPalette.nightSoft})`,
  border: `1px solid color-mix(in srgb, ${themeVars.accentSecondary} 20%, white)`,
  color: "#effaf7",
  boxShadow: themeVars.shadowSoft,
  backdropFilter: `blur(${themeVars.blurSm}) saturate(${themeVars.saturation})`
};

export const insetTrackStyle: CSSProperties = {
  height: 10,
  borderRadius: themeVars.radiusPill,
  background: `color-mix(in srgb, ${themeVars.accentPrimary} 10%, ${themeVars.bgBase})`,
  overflow: "hidden"
};

export const actionChipStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: themeVars.radiusPill,
  border: `1px solid ${kitPalette.borderStrong}`,
  background: kitPalette.panelStrong,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.04em",
  color: kitPalette.accent
};

export const codeChipStyle: CSSProperties = {
  fontSize: 13,
  color: "#effaf7",
  fontFamily: kitFonts.mono
};

export const nightSubtleTextStyle: CSSProperties = {
  margin: 0,
  color: "rgba(239,250,247,0.78)",
  lineHeight: 1.6
};

function resolveAccent(accent: SurfaceProps["accent"]): CSSProperties {
  switch (accent) {
    case "night":
      return {
        background: `linear-gradient(180deg, ${kitPalette.night}, ${kitPalette.nightSoft})`,
        color: "#effaf7",
        border: `1px solid color-mix(in srgb, ${themeVars.accentSecondary} 20%, white)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), ${themeVars.shadowMedium}`
      };
    case "warm":
      return {
        background: `linear-gradient(180deg, color-mix(in srgb, ${themeVars.warning} 12%, white), ${kitPalette.panelStrong})`,
        color: kitPalette.ink,
        border: `1px solid color-mix(in srgb, ${themeVars.warning} 32%, white)`,
        boxShadow: themeVars.shadowMedium
      };
    default:
      return {
        background: `linear-gradient(180deg, ${kitPalette.panelStrong}, ${kitPalette.panel})`,
        color: kitPalette.ink,
        border: `1px solid ${kitPalette.border}`,
        boxShadow: themeVars.shadowMedium
      };
  }
}

export interface PageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  spotlight?: ReactNode;
  theme?: Partial<ThemeProfile> & { presetId?: string };
}

export function PageShell({
  eyebrow,
  title,
  description,
  children,
  spotlight,
  theme
}: PageShellProps) {
  const resolvedTheme = resolveThemeProfile(theme);

  return (
    <main
      style={{
        ...buildThemeCssVariables(resolvedTheme.tokens),
        ...pageStyle,
        background: buildBackdropBackground(resolvedTheme.tokens)
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "auto -8% -20% auto",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `color-mix(in srgb, ${themeVars.accentPrimary} 16%, transparent)`,
          filter: `blur(${themeVars.blurLg})`
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "8% auto auto -10%",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: `color-mix(in srgb, ${themeVars.accentSecondary} 18%, transparent)`,
          filter: `blur(${themeVars.blurLg})`
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1240,
          margin: "0 auto",
          display: "grid",
          gap: 28
        }}
      >
        <section
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            padding: 28,
            borderRadius: themeVars.radiusXl,
            border: `1px solid ${kitPalette.border}`,
            background: `linear-gradient(145deg, ${kitPalette.panelStrong}, ${kitPalette.panel})`,
            backdropFilter: `blur(${themeVars.blurLg}) saturate(${themeVars.saturation})`,
            boxShadow: themeVars.shadowFloating
          }}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <div style={eyebrowStyle}>{eyebrow}</div>
            <h1
              style={{
                margin: 0,
                fontFamily: kitFonts.heading,
                fontSize: "clamp(2.2rem, 4vw, 4.1rem)",
                lineHeight: 1,
                letterSpacing: "-0.04em"
              }}
            >
              {title}
            </h1>
            <p
              style={{
                margin: 0,
                maxWidth: 760,
                color: kitPalette.inkSoft,
                fontSize: "1.02rem",
                lineHeight: 1.65
              }}
            >
              {description}
            </p>
          </div>
          <div>{spotlight}</div>
        </section>
        {children}
      </div>
    </main>
  );
}

export interface SurfaceProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  accent?: "default" | "night" | "warm";
  footer?: ReactNode;
  style?: CSSProperties;
}

export function Surface({
  eyebrow,
  title,
  description,
  children,
  accent = "default",
  footer,
  style
}: SurfaceProps) {
  const isNight = accent === "night";

  return (
    <section
      style={{
        display: "grid",
        gap: 18,
        padding: 24,
        borderRadius: themeVars.radiusLg,
        backdropFilter: `blur(${themeVars.blurMd}) saturate(${themeVars.saturation})`,
        ...resolveAccent(accent),
        ...style
      }}
    >
      {(eyebrow || title || description) && (
        <div style={{ display: "grid", gap: 8 }}>
          {eyebrow ? <div style={eyebrowStyle}>{eyebrow}</div> : null}
          {title ? (
            <h2
              style={{
                margin: 0,
                fontFamily: kitFonts.heading,
                fontSize: "1.6rem",
                lineHeight: 1.05
              }}
            >
              {title}
            </h2>
          ) : null}
          {description ? (
            <p
              style={{
                margin: 0,
                color: isNight ? "rgba(239,250,247,0.78)" : kitPalette.inkSoft,
                lineHeight: 1.6
              }}
            >
              {description}
            </p>
          ) : null}
        </div>
      )}
      <div style={{ display: "grid", gap: 16 }}>{children}</div>
      {footer ? <div>{footer}</div> : null}
    </section>
  );
}

export function Tag({
  children,
  tone = "soft"
}: {
  children: ReactNode;
  tone?: "soft" | "accent" | "warm" | "night";
}) {
  const backgroundByTone = {
    soft: kitPalette.panelStrong,
    accent: `color-mix(in srgb, ${themeVars.accentPrimary} 16%, white)`,
    warm: `color-mix(in srgb, ${themeVars.warning} 16%, white)`,
    night: kitPalette.night
  } as const;

  const colorByTone = {
    soft: kitPalette.ink,
    accent: kitPalette.accent,
    warm: kitPalette.ember,
    night: "#effaf7"
  } as const;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        width: "fit-content",
        padding: "8px 12px",
        borderRadius: themeVars.radiusPill,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        background: backgroundByTone[tone],
        color: colorByTone[tone]
      }}
    >
      {children}
    </span>
  );
}

export function MetricTile({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div
      style={{
        ...glassCardStrongStyle,
        gap: 6
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: kitPalette.inkSoft
        }}
      >
        {label}
      </span>
      <strong
        style={{
          fontFamily: kitFonts.heading,
          fontSize: "2rem",
          lineHeight: 1,
          letterSpacing: "-0.04em"
        }}
      >
        {value}
      </strong>
      <span style={{ color: kitPalette.inkSoft, lineHeight: 1.5 }}>{detail}</span>
    </div>
  );
}

export function ProgressTrack({
  label,
  value,
  tone = "accent"
}: {
  label: string;
  value: number;
  tone?: "accent" | "warm";
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: kitPalette.inkSoft }}>{value}%</span>
      </div>
      <div style={insetTrackStyle}>
        <div
          style={{
            height: "100%",
            width: `${Math.max(0, Math.min(value, 100))}%`,
            borderRadius: themeVars.radiusPill,
            background:
              tone === "warm"
                ? `linear-gradient(90deg, ${themeVars.warning}, color-mix(in srgb, ${themeVars.warning} 55%, white))`
                : `linear-gradient(90deg, ${themeVars.accentPrimary}, ${themeVars.accentSecondary})`
          }}
        />
      </div>
    </div>
  );
}

export const eyebrowStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  width: "fit-content",
  padding: "8px 12px",
  borderRadius: themeVars.radiusPill,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: kitPalette.accent,
  background: `color-mix(in srgb, ${themeVars.accentPrimary} 14%, white)`,
  backdropFilter: `blur(${themeVars.blurSm})`
};

export const subtleTextStyle: CSSProperties = {
  margin: 0,
  color: kitPalette.inkSoft,
  lineHeight: 1.6
};

export const dividedListStyle: CSSProperties = {
  display: "grid",
  gap: 12
};

export const defaultThemeProfile = resolveThemeProfile({
  presetId: defaultThemePreset.id
});
