import type { CodexArtifact, ExportFormat } from "../../shared/codex/contracts.js";
import { assertExportAllowed } from "../../shared/codex/router.js";
import { renderArtifactHtml } from "../../shared/codex/templates/html.js";

export type RenderCodexExportInput = {
  artifact: CodexArtifact;
  format: ExportFormat;
};

export type RenderCodexExportOutput = {
  format: ExportFormat;
  bytes: Buffer;
  contentType: string;
};

export async function renderCodexExport(input: RenderCodexExportInput): Promise<RenderCodexExportOutput> {
  assertExportAllowed(input.artifact, input.format);

  if (input.format === "html") {
    return {
      format: "html",
      bytes: Buffer.from(renderArtifactHtml(input.artifact), "utf8"),
      contentType: "text/html;charset=utf-8",
    };
  }

  if (input.format === "json") {
    return {
      format: "json",
      bytes: Buffer.from(JSON.stringify(input.artifact, null, 2), "utf8"),
      contentType: "application/json;charset=utf-8",
    };
  }

  throw new Error(`Codex ${input.format} export must run through its dedicated durable worker adapter.`);
}
