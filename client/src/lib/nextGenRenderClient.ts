import type {
  RenderDiagnostic,
  RenderTarget,
  SceneGraph,
} from "@shared/rendering/engine/browser";

export type NextGenRenderManifest = {
  ok: true;
  jobId: string;
  output: {
    format: string;
    contentType: string;
    bytes: number;
    previewAvailable: boolean;
  };
  diagnostics: Array<{
    level: "info";
    message: string;
  }>;
};

function contentTypeFor(response: Response): string {
  return response.headers.get("content-type")?.trim() || "application/octet-stream";
}

function isJsonResponse(contentType: string, body: string): boolean {
  return contentType.includes("application/json") || /^[\[{]/.test(body.trim());
}

function byteLength(value: string): number {
  return typeof TextEncoder === "function" ? new TextEncoder().encode(value).byteLength : value.length;
}

export async function parseNextGenRenderResponse(
  response: Response,
  jobId: string,
): Promise<Record<string, unknown>> {
  const contentType = contentTypeFor(response);
  const body = await response.text();

  if (isJsonResponse(contentType, body)) {
    let payload: unknown;
    try {
      payload = JSON.parse(body);
    } catch {
      throw new Error(`NextGen render returned invalid JSON (${contentType}).`);
    }

    if (!response.ok) {
      const error = payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error?: unknown }).error ?? "")
        : "";
      throw new Error(error || `NextGen render returned ${response.status}.`);
    }

    return payload && typeof payload === "object"
      ? payload as Record<string, unknown>
      : { ok: true, jobId, payload };
  }

  if (!response.ok) {
    throw new Error(`NextGen render returned ${response.status} (${contentType}).`);
  }

  const format = contentType.split(";", 1)[0].replace(/^text\//, "") || "binary";
  const manifest: NextGenRenderManifest = {
    ok: true,
    jobId,
    output: {
      format,
      contentType,
      bytes: byteLength(body),
      previewAvailable: format === "html",
    },
    diagnostics: [{
      level: "info",
      message: `Render engine returned ${format.toUpperCase()} output; the result was normalized into a client manifest.`,
    }],
  };
  return manifest;
}

export type RenderArtifactReceipt = {
  id: string;
  format: string;
  backend: string;
  mimeType?: string;
  bytes?: number;
  hash?: string;
  targetStatus?: "success" | "failed" | "unsupported" | "partial";
  downloadUrl?: string | null;
};

export type RenderEngineReceipt = {
  ok: boolean;
  reused?: boolean;
  job?: {
    id: string;
    graphId?: string;
    status: string;
  };
  artifacts?: RenderArtifactReceipt[];
  diagnostics?: RenderDiagnostic[];
  manifest?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export async function submitNextGenRender(input: {
  sceneGraph: SceneGraph;
  targets?: RenderTarget[];
  idempotencyKey?: string;
}): Promise<RenderEngineReceipt> {
  const response = await fetch("/api/render/engine", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      contractVersion: "gestaltview.render-request.v2",
      sourceFamily: "scene_graph",
      sceneGraph: input.sceneGraph,
      targets: input.targets,
      idempotencyKey: input.idempotencyKey,
    }),
  });

  const payload = (await response.json().catch(() => null)) as RenderEngineReceipt | null;
  if (!payload) {
    throw new Error(`Render endpoint returned an unreadable ${response.status} response.`);
  }
  return payload;
}

export async function readNextGenRenderStatus(jobId: string): Promise<RenderEngineReceipt> {
  const response = await fetch(`/api/render/status?jobId=${encodeURIComponent(jobId)}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const payload = (await response.json().catch(() => null)) as RenderEngineReceipt | null;
  if (!payload) {
    throw new Error(`Render status returned an unreadable ${response.status} response.`);
  }
  return payload;
}

export function renderReceiptSummary(receipt: RenderEngineReceipt): {
  title: string;
  detail: string;
  tone: "success" | "warning" | "error";
} {
  const artifacts = receipt.artifacts ?? [];
  const warnings = (receipt.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.severity === "warning",
  );
  if (receipt.ok && receipt.job?.status === "ready") {
    return {
      title: "Artifact ready",
      detail: `${artifacts.length} durable artifact${artifacts.length === 1 ? "" : "s"} created${
        warnings.length ? ` with ${warnings.length} warning${warnings.length === 1 ? "" : "s"}` : ""
      }.`,
      tone: warnings.length ? "warning" : "success",
    };
  }
  if (receipt.job) {
    return {
      title: "Render needs attention",
      detail:
        receipt.error?.message ??
        `${artifacts.length} sibling artifact${artifacts.length === 1 ? "" : "s"} were preserved; inspect the target receipts.`,
      tone: "warning",
    };
  }
  return {
    title: "Render did not start",
    detail: receipt.error?.message ?? "No durable render receipt was created.",
    tone: "error",
  };
}
