import { describe, expect, it } from "vitest";

import {
  DEFAULT_MODEL_HOMES,
  routeModelHome,
} from "@shared/model-homes/registry";

describe("model homes routing", () => {
  it("prefers private/local model homes for Sanctuary private journal work", () => {
    const selected = routeModelHome({
      homes: DEFAULT_MODEL_HOMES,
      room: "sanctuary",
      taskType: "capture",
      modalities: ["text"],
      consentTier: "private_default",
    });

    expect(selected?.privacyTier).toMatch(/local_only|private_cloud/);
    expect(selected?.slug).not.toBe("openai-gpt-4o-synthesis");
  });

  it("does not route identity claims to a model home that can write them directly", () => {
    const selected = routeModelHome({
      homes: DEFAULT_MODEL_HOMES,
      room: "external-scaffold",
      taskType: "identity_claim",
      modalities: ["text"],
      consentTier: "profile_pipeline_allowed",
    });

    expect(selected).toBeTruthy();
    expect(selected?.governance.allowedForIdentityClaims).toBe(false);
  });
});
