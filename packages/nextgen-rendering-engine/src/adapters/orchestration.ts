import type {
  RenderArtifact,
  RenderBackend,
  RenderDiagnostic,
  RenderJob,
  RenderResult,
} from "../core/types.js";
import { validateSceneGraph } from "../core/validation.js";
import { result, writeTextArtifact } from "../core/artifacts.js";
import { DiagramBackend } from "./diagram.js";
import { DocumentBackend } from "./document.js";
import { NativeBackend } from "./native.js";
import { WebBackend } from "./web.js";

export class GestaltRenderEngine {
  readonly backends: RenderBackend[];

  constructor(
    backends: RenderBackend[] = [
      new DocumentBackend(),
      new DiagramBackend(),
      new WebBackend(),
      new NativeBackend(),
    ],
  ) {
    this.backends = backends;
  }

  capabilities() {
    return this.backends.map((backend) => backend.capability);
  }

  async render(job: RenderJob): Promise<RenderResult> {
    const validation = validateSceneGraph(job.graph);
    if (validation.some((diagnostic) => diagnostic.severity === "fatal")) {
      return result(job, "gestalt-orchestrator", [], validation, {
        capabilities: this.capabilities(),
      });
    }

    const requestedFormats = new Set(
      (job.targets ?? []).map((target) => target.format.toLowerCase()),
    );
    const selected = this.backends.filter((backend) => {
      if (!backend.canRender(job)) return false;
      if (requestedFormats.size === 0) return true;
      return backend.capability.supportedFormats.some((format) =>
        requestedFormats.has(format.toLowerCase()),
      );
    });

    const diagnostics: RenderDiagnostic[] = [...validation];
    const artifacts: RenderArtifact[] = [];

    if (selected.length === 0) {
      diagnostics.push({
        code: "NO_CAPABLE_BACKEND",
        message: "No verified backend can render the requested node and format combination.",
        severity: "fatal",
        stage: "dispatch",
        details: {
          requestedFormats: [...requestedFormats],
          nodeTypes: [...new Set(job.graph.nodes.map((node) => node.type))],
        },
      });
    } else {
      const settled = await Promise.allSettled(
        selected.map((backend) => backend.render(job)),
      );

      settled.forEach((outcome, index) => {
        const backend = selected[index];
        if (outcome.status === "fulfilled") {
          artifacts.push(...outcome.value.artifacts);
          diagnostics.push(...outcome.value.diagnostics);
          return;
        }

        diagnostics.push({
          code: "BACKEND_RENDER_FAILED",
          message: `${backend.capability.id} failed without cancelling successful sibling backends: ${
            outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason)
          }`,
          severity: "retryable",
          stage: "rendering",
          details: { backend: backend.capability.id },
        });
      });
    }

    const producedFormats = new Set(artifacts.map((artifact) => artifact.format.toLowerCase()));
    for (const target of job.targets ?? []) {
      if (!producedFormats.has(target.format.toLowerCase())) {
        diagnostics.push({
          code: "TARGET_NOT_PRODUCED",
          message: `The requested ${target.format} target was not produced${
            target.required === false ? "; the target was optional" : ""
          }.`,
          severity: target.required === false ? "warning" : "fatal",
          stage: "rendering",
          details: { format: target.format, required: target.required !== false },
        });
      }
    }

    const manifestPayload = {
      jobId: job.jobId,
      graphId: job.graph.graphId,
      backends: selected.map((backend) => backend.capability.id),
      requestedFormats: [...requestedFormats],
      producedFormats: [...producedFormats],
      artifacts,
      diagnostics,
    };
    const manifestArtifact = await writeTextArtifact(
      job,
      "gestalt-orchestrator",
      `${job.jobId}.render-manifest.json`,
      JSON.stringify(manifestPayload, null, 2),
      "json",
      { internalManifest: true },
    );

    return result(
      job,
      "gestalt-orchestrator",
      [...artifacts, manifestArtifact],
      diagnostics,
      {
        backendCount: selected.length,
        capabilities: this.capabilities(),
        requestedFormats: [...requestedFormats],
        producedFormats: [...producedFormats],
      },
    );
  }
}
