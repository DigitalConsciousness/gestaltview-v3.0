import { describe, expect, it } from "vitest";

import { normalizeProfilePreferencesForStorage, type ProfilePreferences } from "@/pages/ProfilePage";

describe("profile preferences", () => {
  it("does not persist raw data URL avatar payloads", () => {
    const preferences: ProfilePreferences = {
      displayName: "Keith",
      avatarUrl: "data:image/png;base64,abc123",
      embodimentProfileSlug: "billy",
    };

    expect(normalizeProfilePreferencesForStorage(preferences)).toEqual({
      displayName: "Keith",
      avatarUrl: "",
      embodimentProfileSlug: "billy",
    });
  });

  it("keeps URL-sized avatar references", () => {
    const preferences: ProfilePreferences = {
      displayName: "Keith",
      avatarUrl: "https://example.test/avatar.png",
      embodimentProfileSlug: "billy",
    };

    expect(normalizeProfilePreferencesForStorage(preferences).avatarUrl).toBe("https://example.test/avatar.png");
  });
});
