import { describe, expect, it } from "vitest";
import {
  buildThemeFromBrandColor,
  exportThemeProfile,
  importThemeProfile,
  resolveThemeProfile,
  themePresets,
  validateThemeAccessibility
} from "../../config/themeEngine";

describe("theme engine", () => {
  it("ships multiple premium presets", () => {
    expect(themePresets.length).toBeGreaterThanOrEqual(5);
    expect(themePresets.map((preset) => preset.id)).toContain("atlas-neutral");
  });

  it("round-trips a brand-derived theme profile through json", () => {
    const profile = buildThemeFromBrandColor("Buyer Theme", "#145f8f", "business");
    const exported = exportThemeProfile(profile);
    const imported = importThemeProfile(exported);

    expect(imported.name).toBe("Buyer Theme");
    expect(imported.tokens.color.accentPrimary).toBe("#145f8f");
  });

  it("validates preset accessibility", () => {
    const presetProfile = resolveThemeProfile({ presetId: "atlas-neutral" });
    const result = validateThemeAccessibility(presetProfile.tokens);

    expect(result.passes).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });
});
