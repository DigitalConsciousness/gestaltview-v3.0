import type { CSSProperties } from "react";
import { z } from "zod";
import type { BuyerSegment } from "./segments.js";

const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const themeTokensSchema = z.object({
  color: z.object({
    bgBase: hexColorSchema,
    bgElevated: hexColorSchema,
    panelGlass: z.string().min(1),
    panelGlassStrong: z.string().min(1),
    borderSoft: z.string().min(1),
    borderStrong: z.string().min(1),
    textPrimary: hexColorSchema,
    textSecondary: z.string().min(1),
    accentPrimary: hexColorSchema,
    accentSecondary: hexColorSchema,
    success: hexColorSchema,
    warning: hexColorSchema,
    danger: hexColorSchema
  }),
  gradient: z.object({
    heroA: hexColorSchema,
    heroB: hexColorSchema,
    heroC: hexColorSchema,
    meshOpacity: z.number().min(0).max(1)
  }),
  glass: z.object({
    blurSm: z.string().min(1),
    blurMd: z.string().min(1),
    blurLg: z.string().min(1),
    saturation: z.string().min(1),
    opacitySoft: z.number().min(0).max(1),
    opacityStrong: z.number().min(0).max(1)
  }),
  radius: z.object({
    sm: z.string().min(1),
    md: z.string().min(1),
    lg: z.string().min(1),
    xl: z.string().min(1),
    pill: z.string().min(1)
  }),
  shadow: z.object({
    soft: z.string().min(1),
    medium: z.string().min(1),
    floating: z.string().min(1)
  }),
  motion: z.object({
    fast: z.string().min(1),
    base: z.string().min(1),
    slow: z.string().min(1),
    enabled: z.boolean()
  }),
  typography: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
    mono: z.string().min(1)
  }),
  density: z.enum(["compact", "comfortable", "airy"])
});

export type ThemeTokens = z.infer<typeof themeTokensSchema>;

export const themeProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  segment: z.enum(["solo", "business", "enterprise"]).optional(),
  presetId: z.string().min(1).optional(),
  isDefault: z.boolean().optional(),
  tokens: themeTokensSchema
});

export type ThemeProfile = z.infer<typeof themeProfileSchema>;

export interface ThemePreset {
  id: string;
  label: string;
  description: string;
  bestFor: BuyerSegment[];
  tokens: ThemeTokens;
}

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function clampOpacity(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function hexToRgb(value: string): RgbColor {
  const normalized = value.replace("#", "");
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  };
}

function rgbToHex(rgb: RgbColor): string {
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixColors(a: string, b: string, amount: number): string {
  const from = hexToRgb(a);
  const to = hexToRgb(b);
  const ratio = clampOpacity(amount);

  return rgbToHex({
    r: from.r + (to.r - from.r) * ratio,
    g: from.g + (to.g - from.g) * ratio,
    b: from.b + (to.b - from.b) * ratio
  });
}

function rgba(color: string, alpha: number): string {
  const rgb = hexToRgb(color);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clampOpacity(alpha)})`;
}

function relativeLuminance(color: string): number {
  const normalized = color.startsWith("rgba(")
    ? color
    : color.startsWith("rgb(")
      ? color
      : `rgb(${hexToRgb(color).r}, ${hexToRgb(color).g}, ${hexToRgb(color).b})`;

  const matches = normalized.match(/\d+(\.\d+)?/g) ?? [];
  const [red, green, blue] = matches.slice(0, 3).map((value) => Number(value) / 255);
  const channels = [red, green, blue].map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function createThemeTokens(input: {
  brand: string;
  accent?: string;
  heading: string;
  body: string;
  mono: string;
  density?: ThemeTokens["density"];
  neutral?: boolean;
}): ThemeTokens {
  const brand = input.neutral ? "#42545a" : input.brand;
  const accent = input.accent ?? mixColors(brand, "#7ee3d0", 0.32);
  const bgBase = input.neutral ? "#0b1317" : mixColors("#06100f", brand, 0.18);
  const bgElevated = mixColors(bgBase, "#f3f8f6", 0.1);
  const textPrimary = input.neutral ? "#102528" : "#14302d";
  const textSecondary = input.neutral ? "rgba(22, 43, 47, 0.74)" : "rgba(49, 78, 73, 0.78)";

  return {
    color: {
      bgBase,
      bgElevated,
      panelGlass: rgba("#f8fcfb", 0.68),
      panelGlassStrong: rgba("#fbfdfc", 0.84),
      borderSoft: rgba("#eff7f4", 0.18),
      borderStrong: rgba(brand, 0.24),
      textPrimary,
      textSecondary,
      accentPrimary: brand,
      accentSecondary: accent,
      success: "#1f936e",
      warning: "#bf7a34",
      danger: "#c05555"
    },
    gradient: {
      heroA: mixColors(brand, "#49dbba", 0.22),
      heroB: mixColors(accent, "#88d7ff", 0.4),
      heroC: input.neutral ? "#9e7d68" : mixColors(brand, "#d38758", 0.5),
      meshOpacity: input.neutral ? 0.12 : 0.18
    },
    glass: {
      blurSm: "10px",
      blurMd: "18px",
      blurLg: "26px",
      saturation: "135%",
      opacitySoft: 0.68,
      opacityStrong: 0.84
    },
    radius: {
      sm: "14px",
      md: "20px",
      lg: "28px",
      xl: "36px",
      pill: "999px"
    },
    shadow: {
      soft: "0 10px 30px rgba(3, 11, 9, 0.14)",
      medium: "0 18px 50px rgba(3, 11, 9, 0.24)",
      floating: "0 30px 80px rgba(3, 11, 9, 0.34)"
    },
    motion: {
      fast: "120ms",
      base: "220ms",
      slow: "380ms",
      enabled: true
    },
    typography: {
      heading: input.heading,
      body: input.body,
      mono: input.mono
    },
    density: input.density ?? "comfortable"
  };
}

export const themePresets: ThemePreset[] = [
  {
    id: "lagoon-glass",
    label: "Lagoon Glass",
    description: "Expressive aqua gradients with a premium glass studio feel.",
    bestFor: ["solo", "business"],
    tokens: createThemeTokens({
      brand: "#0f6b60",
      accent: "#6ab8a7",
      heading: "\"Fraunces\", \"Iowan Old Style\", serif",
      body: "\"IBM Plex Sans\", \"Avenir Next\", sans-serif",
      mono: "\"IBM Plex Mono\", \"SFMono-Regular\", monospace"
    })
  },
  {
    id: "copper-signal",
    label: "Copper Signal",
    description: "Warmer highlights for consultancy, coaching, and personality-led operators.",
    bestFor: ["solo", "business"],
    tokens: createThemeTokens({
      brand: "#9f5e37",
      accent: "#d29561",
      heading: "\"Fraunces\", \"Iowan Old Style\", serif",
      body: "\"IBM Plex Sans\", \"Avenir Next\", sans-serif",
      mono: "\"IBM Plex Mono\", \"SFMono-Regular\", monospace",
      density: "comfortable"
    })
  },
  {
    id: "signal-noir",
    label: "Signal Noir",
    description: "Higher-contrast command center styling for technical operators.",
    bestFor: ["business", "enterprise"],
    tokens: createThemeTokens({
      brand: "#1c7d8e",
      accent: "#93e6f3",
      heading: "\"Bricolage Grotesque\", \"Segoe UI\", sans-serif",
      body: "\"IBM Plex Sans\", \"Avenir Next\", sans-serif",
      mono: "\"IBM Plex Mono\", \"SFMono-Regular\", monospace",
      density: "compact"
    })
  },
  {
    id: "atlas-neutral",
    label: "Atlas Neutral",
    description: "Enterprise-safe styling with restrained color and accessible contrast.",
    bestFor: ["business", "enterprise"],
    tokens: createThemeTokens({
      brand: "#4a5f67",
      accent: "#7f98a1",
      heading: "\"Source Serif 4\", \"Georgia\", serif",
      body: "\"Source Sans 3\", \"Segoe UI\", sans-serif",
      mono: "\"IBM Plex Mono\", \"SFMono-Regular\", monospace",
      density: "compact",
      neutral: true
    })
  },
  {
    id: "orchard-air",
    label: "Orchard Air",
    description: "Brighter, airier surfaces for teams that want a lighter premium shell.",
    bestFor: ["solo", "business"],
    tokens: createThemeTokens({
      brand: "#237461",
      accent: "#90d1b0",
      heading: "\"DM Serif Display\", \"Georgia\", serif",
      body: "\"Plus Jakarta Sans\", \"Segoe UI\", sans-serif",
      mono: "\"IBM Plex Mono\", \"SFMono-Regular\", monospace",
      density: "airy"
    })
  }
];

export const enterpriseNeutralPreset = themePresets.find(
  (preset) => preset.id === "atlas-neutral"
) ?? themePresets[0];

export const defaultThemePreset = themePresets[0];

export const themeVars = {
  bgBase: "var(--gsvw-color-bg-base)",
  bgElevated: "var(--gsvw-color-bg-elevated)",
  panelGlass: "var(--gsvw-color-panel-glass)",
  panelGlassStrong: "var(--gsvw-color-panel-glass-strong)",
  borderSoft: "var(--gsvw-color-border-soft)",
  borderStrong: "var(--gsvw-color-border-strong)",
  textPrimary: "var(--gsvw-color-text-primary)",
  textSecondary: "var(--gsvw-color-text-secondary)",
  accentPrimary: "var(--gsvw-color-accent-primary)",
  accentSecondary: "var(--gsvw-color-accent-secondary)",
  success: "var(--gsvw-color-success)",
  warning: "var(--gsvw-color-warning)",
  danger: "var(--gsvw-color-danger)",
  radiusSm: "var(--gsvw-radius-sm)",
  radiusMd: "var(--gsvw-radius-md)",
  radiusLg: "var(--gsvw-radius-lg)",
  radiusXl: "var(--gsvw-radius-xl)",
  radiusPill: "var(--gsvw-radius-pill)",
  shadowSoft: "var(--gsvw-shadow-soft)",
  shadowMedium: "var(--gsvw-shadow-medium)",
  shadowFloating: "var(--gsvw-shadow-floating)",
  blurSm: "var(--gsvw-glass-blur-sm)",
  blurMd: "var(--gsvw-glass-blur-md)",
  blurLg: "var(--gsvw-glass-blur-lg)",
  saturation: "var(--gsvw-glass-saturation)",
  fontHeading: "var(--gsvw-font-heading)",
  fontBody: "var(--gsvw-font-body)",
  fontMono: "var(--gsvw-font-mono)"
} as const;

export function getThemePreset(presetId: string): ThemePreset | null {
  return themePresets.find((preset) => preset.id === presetId) ?? null;
}

export function buildThemeFromBrandColor(
  name: string,
  brandColor: string,
  segment: BuyerSegment = "solo"
): ThemeProfile {
  return {
    id: `theme-${brandColor.replace("#", "").toLowerCase()}`,
    name,
    segment,
    tokens: createThemeTokens({
      brand: brandColor,
      heading: defaultThemePreset.tokens.typography.heading,
      body: defaultThemePreset.tokens.typography.body,
      mono: defaultThemePreset.tokens.typography.mono
    })
  };
}

export function resolveThemeProfile(
  input?: Partial<ThemeProfile> & { presetId?: string }
): ThemeProfile {
  const preset = input?.presetId ? getThemePreset(input.presetId) : null;
  const baseProfile: ThemeProfile = {
    id: preset?.id ?? defaultThemePreset.id,
    name: preset?.label ?? defaultThemePreset.label,
    segment: input?.segment,
    presetId: preset?.id ?? defaultThemePreset.id,
    isDefault: input?.isDefault ?? true,
    tokens: preset?.tokens ?? defaultThemePreset.tokens
  };

  if (!input?.tokens) {
    return baseProfile;
  }

  return {
    ...baseProfile,
    ...input,
    tokens: themeTokensSchema.parse(input.tokens)
  };
}

export function exportThemeProfile(profile: ThemeProfile): string {
  return JSON.stringify(themeProfileSchema.parse(profile), null, 2);
}

export function importThemeProfile(text: string): ThemeProfile {
  return themeProfileSchema.parse(JSON.parse(text));
}

export function buildThemeCssVariables(tokens: ThemeTokens): CSSProperties {
  return {
    "--gsvw-color-bg-base": tokens.color.bgBase,
    "--gsvw-color-bg-elevated": tokens.color.bgElevated,
    "--gsvw-color-panel-glass": tokens.color.panelGlass,
    "--gsvw-color-panel-glass-strong": tokens.color.panelGlassStrong,
    "--gsvw-color-border-soft": tokens.color.borderSoft,
    "--gsvw-color-border-strong": tokens.color.borderStrong,
    "--gsvw-color-text-primary": tokens.color.textPrimary,
    "--gsvw-color-text-secondary": tokens.color.textSecondary,
    "--gsvw-color-accent-primary": tokens.color.accentPrimary,
    "--gsvw-color-accent-secondary": tokens.color.accentSecondary,
    "--gsvw-color-success": tokens.color.success,
    "--gsvw-color-warning": tokens.color.warning,
    "--gsvw-color-danger": tokens.color.danger,
    "--gsvw-radius-sm": tokens.radius.sm,
    "--gsvw-radius-md": tokens.radius.md,
    "--gsvw-radius-lg": tokens.radius.lg,
    "--gsvw-radius-xl": tokens.radius.xl,
    "--gsvw-radius-pill": tokens.radius.pill,
    "--gsvw-shadow-soft": tokens.shadow.soft,
    "--gsvw-shadow-medium": tokens.shadow.medium,
    "--gsvw-shadow-floating": tokens.shadow.floating,
    "--gsvw-glass-blur-sm": tokens.glass.blurSm,
    "--gsvw-glass-blur-md": tokens.glass.blurMd,
    "--gsvw-glass-blur-lg": tokens.glass.blurLg,
    "--gsvw-glass-saturation": tokens.glass.saturation,
    "--gsvw-font-heading": tokens.typography.heading,
    "--gsvw-font-body": tokens.typography.body,
    "--gsvw-font-mono": tokens.typography.mono
  } as CSSProperties;
}

export function buildBackdropBackground(tokens: ThemeTokens): string {
  return `
    radial-gradient(circle at 0% 0%, ${rgba(tokens.gradient.heroA, tokens.gradient.meshOpacity)}, transparent 30%),
    radial-gradient(circle at 100% 18%, ${rgba(tokens.gradient.heroB, tokens.gradient.meshOpacity * 0.84)}, transparent 26%),
    radial-gradient(circle at 50% 100%, ${rgba(tokens.gradient.heroC, tokens.gradient.meshOpacity * 0.86)}, transparent 28%),
    linear-gradient(180deg, ${tokens.color.bgBase} 0%, ${tokens.color.bgElevated} 100%)
  `;
}

export function validateThemeAccessibility(tokens: ThemeTokens): {
  passes: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const textContrast = contrastRatio(tokens.color.textPrimary, "#ffffff");
  const accentContrast = contrastRatio(tokens.color.accentPrimary, "#ffffff");
  const bodyContrast = contrastRatio(tokens.color.textPrimary, "#ffffff");

  if (bodyContrast < 4.5) {
    warnings.push("Primary text contrast falls below the 4.5:1 target.");
  }
  if (textContrast < 4.5) {
    warnings.push("Glass surfaces need a stronger text color or darker panel treatment.");
  }
  if (accentContrast < 3) {
    warnings.push("Accent color is too light for badges and focus states.");
  }

  return {
    passes: warnings.length === 0,
    warnings
  };
}
