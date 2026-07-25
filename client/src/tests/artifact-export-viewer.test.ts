import { describe, expect, it } from "vitest";

import {
  buildArtifactExportEndpoint,
  buildCodexJobEndpoint,
  pickInitialArtifactExportFormat,
  resolveArtifactExportRetrievalMode,
  shouldShowCodexRerunExportButton,
} from "@/lib/rendering/artifactExport";
import { shouldToastExportReady } from "@/lib/rendering/ArtifactExportViewer";
import { resolveArtifactExportViewerHtml } from "@/lib/rendering/ArtifactExportViewer";

describe("artifact export viewer helpers", () => {
  it("defaults persistent retrieval to preview unless html is selected", () => {
    expect(resolveArtifactExportRetrievalMode("persistent", "html")).toBe("persistent");
    expect(resolveArtifactExportRetrievalMode("persistent", "json")).toBe("preview");
    expect(resolveArtifactExportRetrievalMode("preview", "html")).toBe("preview");
  });

  it("builds the codex export and job endpoints from the api base", () => {
    expect(buildArtifactExportEndpoint("/api", "artifact-1", "html", "preview")).toBe(
      "/api/codex/artifacts/artifact-1/exports/html?mode=preview",
    );
    expect(buildCodexJobEndpoint("/api", "job-1")).toBe("/api/codex/jobs/job-1");
  });

  it("picks a sensible initial format and rerun visibility", () => {
    const exports = [
      { format: "json" as const, status: "pending" as const },
      { format: "html" as const, status: "ready" as const },
    ];

    expect(pickInitialArtifactExportFormat(exports, "html")).toBe("html");
    expect(pickInitialArtifactExportFormat(exports, "pdf")).toBe("html");
    expect(shouldShowCodexRerunExportButton([{ status: "pending" }, { status: "failed" }])).toBe(true);
    expect(shouldShowCodexRerunExportButton([{ status: "ready" }, { status: "pending" }])).toBe(false);
  });

  it("toasts when a pending export becomes ready", () => {
    expect(shouldToastExportReady("pending", "ready")).toBe(true);
    expect(shouldToastExportReady("loading", "ready")).toBe(false);
    expect(shouldToastExportReady("pending", "pending")).toBe(false);
  });

  it("prefers the local rendered html shell over signed-url html previews", () => {
    expect(
      resolveArtifactExportViewerHtml({
        selectedFormat: "html",
        exportHtml: undefined,
        fallbackHtml: "<!doctype html><html><body><h1>Rendered</h1></body></html>",
      }),
    ).toBe("<!doctype html><html><body><h1>Rendered</h1></body></html>");

    expect(
      resolveArtifactExportViewerHtml({
        selectedFormat: "json",
        exportHtml: undefined,
        fallbackHtml: "<!doctype html><html><body><h1>Rendered</h1></body></html>",
      }),
    ).toBeUndefined();
  });
});
