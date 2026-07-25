import { describe, expect, it } from "vitest";
import { createImportManifestTemplate } from "../../config/importTemplates";
import { handlePacksRoute } from "../../api/packs";

describe("import manifest template", () => {
  it("creates a buyer-owned starter manifest", () => {
    const manifest = createImportManifestTemplate();

    expect(manifest.schemaVersion).toBe("1.1.0");
    expect(manifest.repoContainer).toContain("repo-corpus");
    expect(manifest.entries.length).toBeGreaterThanOrEqual(4);
    expect(manifest.entries[0]?.lane).toBe("knowledge");
    expect(manifest.entries[0]?.sourceUri).toContain("your-document");
  });

  it("rejects manifest route requests without a pack slug", async () => {
    const result = await handlePacksRoute({
      method: "POST",
      action: "manifest"
    });

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("missing_pack_slug");
  });
});
