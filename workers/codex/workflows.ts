import type { CodexArtifact, ExportFormat } from "../../shared/codex/contracts.js";
import type { RenderCodexExportOutput } from "./activities.js";
import { renderCodexExport } from "./activities.js";

export type CodexExportWorkflowInput = {
  artifact: CodexArtifact;
  format: ExportFormat;
};

export async function codexExportWorkflow(input: CodexExportWorkflowInput): Promise<RenderCodexExportOutput> {
  return renderCodexExport(input);
}
