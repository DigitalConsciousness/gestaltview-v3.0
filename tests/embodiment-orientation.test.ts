/**
 * tests/embodiment-orientation.test.ts
 * =====================================
 * Unit tests for the orientation_state field added to all embodiment profiles
 * in v1.0. Verifies that the field is present, well-formed, and that the
 * EmbodimentOrientationState type is correctly exported from shared/embodiment.
 *
 * Run with: pnpm vitest run tests/embodiment-orientation.test.ts
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import type { EmbodimentProfile, EmbodimentOrientationState } from "../shared/embodiment/types.js";

const PROFILES_DIR = join(__dirname, "..", "embodiment_profiles");

function loadProfiles(): EmbodimentProfile[] {
  const files = readdirSync(PROFILES_DIR).filter((f) => f.endsWith(".embodiment.json"));
  return files.map((file) => {
    const raw = readFileSync(join(PROFILES_DIR, file), "utf-8");
    return JSON.parse(raw) as EmbodimentProfile;
  });
}

describe("orientation_state — all embodiment profiles", () => {
  const profiles = loadProfiles();

  it("all 24 profiles have orientation_state", () => {
    expect(profiles.length).toBeGreaterThanOrEqual(24);
    for (const profile of profiles) {
      expect(
        profile.orientation_state,
        `Profile ${profile.slug} is missing orientation_state`
      ).toBeDefined();
    }
  });

  it("all orientation_state blocks have required fields", () => {
    for (const profile of profiles) {
      const state = profile.orientation_state as EmbodimentOrientationState;
      if (!state) continue;

      expect(
        typeof state.checkpoint_ref,
        `${profile.slug}.orientation_state.checkpoint_ref must be a string`
      ).toBe("string");

      expect(
        typeof state.last_absorbed_checkpoint_id,
        `${profile.slug}.orientation_state.last_absorbed_checkpoint_id must be a string`
      ).toBe("string");

      expect(
        ["current", "stale", "pending"].includes(state.absorption_status),
        `${profile.slug}.orientation_state.absorption_status must be current|stale|pending`
      ).toBe(true);

      expect(
        typeof state.needs_reorientation,
        `${profile.slug}.orientation_state.needs_reorientation must be a boolean`
      ).toBe("boolean");

      expect(
        typeof state.orientation_confidence,
        `${profile.slug}.orientation_state.orientation_confidence must be a number`
      ).toBe("number");

      expect(
        state.orientation_confidence >= 0 && state.orientation_confidence <= 1,
        `${profile.slug}.orientation_state.orientation_confidence must be 0.0–1.0`
      ).toBe(true);
    }
  });

  it("all profiles default to absorption_status: current", () => {
    for (const profile of profiles) {
      expect(
        profile.orientation_state?.absorption_status,
        `${profile.slug} should default to absorption_status: current`
      ).toBe("current");
    }
  });

  it("all profiles default to needs_reorientation: false", () => {
    for (const profile of profiles) {
      expect(
        profile.orientation_state?.needs_reorientation,
        `${profile.slug} should default to needs_reorientation: false`
      ).toBe(false);
    }
  });
});

describe("orientation_state — specific profiles", () => {
  const profiles = loadProfiles();
  const bySlug = Object.fromEntries(profiles.map((p) => [p.slug, p]));

  it("billy profile has orientation_state", () => {
    expect(bySlug["billy"]?.orientation_state).toBeDefined();
  });

  it("art-teacher profile has orientation_state", () => {
    expect(bySlug["art-teacher"]?.orientation_state).toBeDefined();
  });

  it("gate-keeper profile has orientation_state", () => {
    expect(bySlug["gate-keeper"]?.orientation_state).toBeDefined();
  });

  it("sanctuary-keeper profile has orientation_state", () => {
    expect(bySlug["sanctuary-keeper"]?.orientation_state).toBeDefined();
  });
});
