import { describe, expect, it } from "vitest";

import {
  consumeStoredAuthRedirect,
  isSafeInternalRedirect,
  persistAuthRedirect,
  readStoredAuthRedirect,
} from "../lib/authRedirect";
import { readSupabaseCallbackTokens } from "../lib/supabaseAuth";

function createStorage(initialValue?: string | null) {
  let value = initialValue ?? null;

  return {
    getItem: () => value,
    setItem: (_key: string, nextValue: string) => {
      value = nextValue;
    },
    removeItem: () => {
      value = null;
    },
  };
}

describe("authRedirect helpers", () => {
  it("accepts only safe internal redirects", () => {
    expect(isSafeInternalRedirect("/dashboard")).toBe(true);
    expect(isSafeInternalRedirect("/agent-trainer/control-plane?tab=queue")).toBe(true);
    expect(isSafeInternalRedirect("https://example.com")).toBe(false);
    expect(isSafeInternalRedirect("//evil.example")).toBe(false);
  });

  it("persists and consumes only safe redirects", () => {
    const storage = createStorage();

    persistAuthRedirect(storage, "/billy");
    expect(readStoredAuthRedirect(storage, "/")).toBe("/billy");
    expect(consumeStoredAuthRedirect(storage, "/")).toBe("/billy");
    expect(readStoredAuthRedirect(storage, "/")).toBe("/");

    persistAuthRedirect(storage, "https://example.com");
    expect(readStoredAuthRedirect(storage, "/")).toBe("/");
  });
});

describe("Supabase callback token parsing", () => {
  it("detects PKCE callback codes", () => {
    expect(readSupabaseCallbackTokens("https://app.example/auth/callback?code=abc123&redirect=/dashboard")).toEqual({
      kind: "pkce",
      code: "abc123",
    });
  });

  it("detects implicit callback tokens", () => {
    expect(
      readSupabaseCallbackTokens(
        "https://app.example/auth/callback#access_token=access123&refresh_token=refresh123&type=magiclink"
      )
    ).toEqual({
      kind: "implicit",
      accessToken: "access123",
      refreshToken: "refresh123",
    });
  });

  it("ignores callback URLs without session material", () => {
    expect(readSupabaseCallbackTokens("https://app.example/auth/callback?redirect=/dashboard")).toEqual({
      kind: "none",
    });
  });
});
