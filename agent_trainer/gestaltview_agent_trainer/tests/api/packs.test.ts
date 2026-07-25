import { describe, expect, it } from "vitest";
import {
  buildStarterPackRouteRequest,
  buildImportManifestForPack,
  buildStarterPackPlan,
  handlePacksRoute,
  listSourceBundles,
  previewStarterPacks
} from "../../api/packs";

describe("starter packs", () => {
  it("returns preview metadata for pack application", () => {
    const previews = previewStarterPacks();
    const devopsPack = previews.find((pack) => pack.slug === "devops-terminal-pack");

    expect(devopsPack).toBeDefined();
    expect(devopsPack?.recommendedSourceBundles).toContain("code-context-bundle");
    expect(devopsPack?.generatedMemoryKeys).toContain("operator_prefers_cli");
  });

  it("lists source bundles by lane", () => {
    const bundles = listSourceBundles();
    expect(bundles.some((bundle) => bundle.lane === "context")).toBe(true);
    expect(bundles.some((bundle) => bundle.slug === "code-context-bundle")).toBe(true);
  });

  it("builds an activation plan from a starter pack", () => {
    const result = buildStarterPackPlan("devops-terminal-pack");

    expect(result.error).toBeNull();
    expect(result.data?.selectedSourceBundles).toContain("code-context-bundle");
    expect(result.data?.generatedMemoryKeys).toContain("operator_prefers_cli");
  });

  it("builds an import manifest from the selected pack plan", () => {
    const result = buildImportManifestForPack(
      "general-operator-foundation",
      "demo-project",
      "demo-owner"
    );

    expect(result.error).toBeNull();
    expect(result.data?.projectName).toBe("demo-project");
    expect(result.data?.entries.length).toBeGreaterThan(0);
  });

  it("exposes a route-style pack adapter", async () => {
    const result = await handlePacksRoute({
      method: "POST",
      action: "manifest",
      packSlug: "agent-source-starter-bundle",
      projectName: "buyer-project",
      owner: "buyer-owner"
    });

    expect(result.error).toBeNull();
    expect("entries" in (result.data ?? {})).toBe(true);
  });

  it("builds a route request for pack application", () => {
    const request = buildStarterPackRouteRequest({
      userId: "user-1",
      packSlug: "general-operator-foundation",
      projectName: "buyer-project",
      owner: "buyer-owner",
      selectedBundleSlugs: ["knowledge-core-bundle"]
    });

    expect(request.action).toBe("apply");
    expect(request.userId).toBe("user-1");
    expect(request.selectedBundleSlugs).toContain("knowledge-core-bundle");
  });

  it("requires env-backed handling for apply route preview", async () => {
    const result = await handlePacksRoute({
      method: "POST",
      action: "apply",
      userId: "user-1",
      packSlug: "general-operator-foundation"
    });

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("env_required_for_apply");
  });
});
