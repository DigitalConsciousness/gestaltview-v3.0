import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, relative, resolve } from "node:path";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuthUser } from "../_lib/auth.js";
import {
  GestaltRenderEngine,
  SupabaseArtifactSink,
  mimeTypeForFormat,
  validateSceneGraph,
} from "../../shared/rendering/engine/server.js";
import type {
  ArtifactSourceRef,
  RenderArtifact,
  RenderDiagnostic,
  RenderJobState,
  RenderTarget,
  SceneGraph,
} from "../../shared/rendering/engine/browser.js";
import { findExistingRenderJob, renderIdempotencyKey } from "./idempotency.js";
import {
  parseRequestBody,
  RenderHttpError,
  type RenderEngineRequest,
} from "./request.js";
import { RenderUserResolutionError, resolveRenderUserId } from "./user-id.js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";
const SYNC_TIMEOUT_MS = 25_000;
const MAX_SOURCE_CHARS = 2_000_000;
const VERIFIED_SYNC_FORMATS = new Set(["html", "svg", "mmd", "json"]);
const PLANNED_FORMATS = new Set([
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "pptx",
  "xlsx",
  "csv",
  "mp4",
  "webm",
  "mp3",
  "wav",
]);

type StoredArtifact = RenderArtifact & {
  id: string;
};

function ensurePersistenceConfigured(): void {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new RenderHttpError(
      503,
      "RENDER_PERSISTENCE_UNAVAILABLE",
      "The render ledger and artifact store are not configured.",
    );
  }
}

function configureCors(req: VercelRequest, res: VercelResponse): void {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const allowed = (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Idempotency-Key");
}

async function supabaseRequest(path: string, init: RequestInit = {}): Promise<Response> {
  ensurePersistenceConfigured();
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });
}

async function requireSupabaseResponse(
  path: string,
  init: RequestInit,
  operation: string,
): Promise<Response> {
  const response = await supabaseRequest(path, init);
  if (!response.ok) {
    throw new Error(`${operation} failed (${response.status}): ${await response.text()}`);
  }
  return response;
}

function defaultTargets(): RenderTarget[] {
  return [
    {
      format: "html",
      mimeType: "text/html",
      destinationIntent: "preview",
      required: true,
    },
  ];
}

function classifyTargets(targets: RenderTarget[]): {
  verified: RenderTarget[];
  unavailable: RenderTarget[];
} {
  const verified: RenderTarget[] = [];
  const unavailable: RenderTarget[] = [];
  for (const target of targets) {
    if (VERIFIED_SYNC_FORMATS.has(target.format.toLowerCase())) verified.push(target);
    else unavailable.push(target);
  }
  return { verified, unavailable };
}

function unavailableTargetDiagnostics(targets: RenderTarget[]): RenderDiagnostic[] {
  return targets.map((target) => ({
    code: PLANNED_FORMATS.has(target.format) ? "TARGET_PLANNED_NOT_WIRED" : "UNSUPPORTED_TARGET",
    message: PLANNED_FORMATS.has(target.format)
      ? `${target.format} is planned but has no verified worker in the deployed render path.`
      : `${target.format} is not supported by a verified backend.`,
    severity: "warning",
    stage: "dispatch",
    details: {
      format: target.format,
      required: target.required,
      targetStatus: "unsupported",
    },
  }));
}

function collectVisibleStrings(value: unknown, depth = 0): string[] {
  if (depth > 5 || value === null || value === undefined) return [];
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectVisibleStrings(item, depth + 1));
  }
  if (typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  const preferredKeys = ["title", "summary", "content", "text", "markdown", "body", "sections"];
  return preferredKeys.flatMap((key) =>
    Object.prototype.hasOwnProperty.call(record, key)
      ? collectVisibleStrings(record[key], depth + 1)
      : [],
  );
}

function uniqueJoined(values: string[]): string {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].join("\n\n");
}

async function fetchSemanticSource(
  sourceFamily: Exclude<RenderEngineRequest["sourceFamily"], "scene_graph">,
  sourceId: string,
  userId: string,
): Promise<{ title: string; content: string }> {
  const encodedId = encodeURIComponent(sourceId);
  const encodedUserId = encodeURIComponent(userId);
  let path: string;
  let read: (row: Record<string, unknown>) => string;

  if (sourceFamily === "codex_artifact") {
    path = `/rest/v1/codex_artifacts?id=eq.${encodedId}&user_id=eq.${encodedUserId}&select=title,body&limit=1`;
    read = (row) => uniqueJoined(collectVisibleStrings(row.body));
  } else if (sourceFamily === "transcriptory") {
    path = `/rest/v1/transcriptory_captures?id=eq.${encodedId}&user_id=eq.${encodedUserId}&select=title,summary,transcript_text,raw_transcript&limit=1`;
    read = (row) =>
      uniqueJoined([
        String(row.summary ?? ""),
        String(row.transcript_text ?? ""),
        String(row.raw_transcript ?? ""),
      ]);
  } else {
    path = `/rest/v1/created_artifacts?id=eq.${encodedId}&userid=eq.${encodedUserId}&deletedat=is.null&select=title,content&limit=1`;
    read = (row) => String(row.content ?? "");
  }

  const response = await requireSupabaseResponse(path, { method: "GET" }, "Source lookup");
  const rows = (await response.json()) as Array<Record<string, unknown>>;
  const row = rows[0];
  if (!row) {
    throw new RenderHttpError(404, "SOURCE_NOT_FOUND", "The source was not found for this user.");
  }

  const content = read(row).trim();
  if (!content) {
    throw new RenderHttpError(
      422,
      "SOURCE_HAS_NO_RENDERABLE_CONTENT",
      "The source exists but contains no verified renderable text.",
    );
  }
  if (content.length > MAX_SOURCE_CHARS) {
    throw new RenderHttpError(
      413,
      "SOURCE_TOO_LARGE",
      `The source exceeds the ${MAX_SOURCE_CHARS}-character render limit.`,
    );
  }
  return {
    title: String(row.title ?? sourceId),
    content,
  };
}

function sceneGraphFromText(content: string, graphId: string, title: string): SceneGraph {
  return {
    schema: "nextgen.scene-graph.v1",
    graphId,
    nodes: [
      {
        id: "root-document",
        type: "Document",
        name: title,
        props: { title },
      },
      {
        id: "markdown-body",
        type: "Markdown",
        name: "body",
        props: { source: content },
      },
    ],
    edges: [
      {
        id: "document-contains-body",
        type: "contains",
        from: "root-document",
        to: "markdown-body",
        props: {},
      },
    ],
  };
}

async function resolveSceneGraph(
  body: RenderEngineRequest,
  userId: string,
): Promise<{ sceneGraph: SceneGraph; sourceId: string; sourceFamily: string }> {
  if (body.sourceFamily === "scene_graph") {
    if (body.sceneGraph) {
      if (
        typeof body.sceneGraph !== "object" ||
        body.sceneGraph === null ||
        Array.isArray(body.sceneGraph)
      ) {
        throw new RenderHttpError(
          422,
          "SCENE_GRAPH_INVALID",
          "sceneGraph must be an object.",
        );
      }
      const graph = body.sceneGraph as SceneGraph;
      return {
        sceneGraph: graph,
        sourceId: typeof graph.graphId === "string" ? graph.graphId : "scene-graph",
        sourceFamily: body.sourceFamily,
      };
    }
    const graphId = `text:${createHash("sha256")
      .update(body.content ?? "")
      .digest("hex")
      .slice(0, 20)}`;
    return {
      sceneGraph: sceneGraphFromText(body.content ?? "", graphId, "Rendered document"),
      sourceId: graphId,
      sourceFamily: body.sourceFamily,
    };
  }

  const sourceId = body.artifactId as string;
  const source = await fetchSemanticSource(body.sourceFamily, sourceId, userId);
  return {
    sceneGraph: sceneGraphFromText(
      source.content,
      `${body.sourceFamily}:${sourceId}`,
      source.title,
    ),
    sourceId,
    sourceFamily: body.sourceFamily,
  };
}

async function createRenderJobRow(params: {
  jobId: string;
  graphId: string;
  userId: string;
  sourceFamily: string;
  sourceId: string;
  sceneGraph: SceneGraph;
  targets: RenderTarget[];
  idempotencyKey: string;
}): Promise<void> {
  await requireSupabaseResponse(
    "/rest/v1/render_jobs",
    {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        id: params.jobId,
        user_id: params.userId,
        source_room: "creation_corner",
        graph_id: params.graphId,
        source_family: params.sourceFamily,
        source_id: params.sourceId,
        scene_graph: params.sceneGraph,
        targets: params.targets,
        idempotency_key: params.idempotencyKey,
        status: "validating",
        diagnostics: [],
        manifest: {},
      }),
    },
    "Render job insert",
  );
}

async function updateRenderJobStatus(
  jobId: string,
  userId: string,
  status: RenderJobState,
  diagnostics: RenderDiagnostic[],
  manifest: Record<string, unknown>,
): Promise<void> {
  await requireSupabaseResponse(
    `/rest/v1/render_jobs?id=eq.${encodeURIComponent(jobId)}&user_id=eq.${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        status,
        diagnostics,
        manifest,
        updated_at: new Date().toISOString(),
      }),
    },
    `Render job ${status} update`,
  );
}

async function createRenderArtifactRow(params: {
  renderJobId: string;
  userId: string;
  artifact: RenderArtifact;
}): Promise<string> {
  const response = await requireSupabaseResponse(
    "/rest/v1/render_artifacts",
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        render_job_id: params.renderJobId,
        user_id: params.userId,
        uri: params.artifact.uri,
        format: params.artifact.format,
        backend: params.artifact.backend,
        bytes: params.artifact.bytes ?? 0,
        mime_type: params.artifact.mimeType ?? mimeTypeForFormat(params.artifact.format),
        storage_bucket: params.artifact.storageBucket ?? "codex-exports",
        storage_path: params.artifact.storagePath ?? "",
        byte_size: params.artifact.bytes ?? 0,
        content_hash: params.artifact.hash ?? "",
        target_status: params.artifact.targetStatus ?? "success",
        metadata: params.artifact.metadata ?? {},
      }),
    },
    "Render artifact insert",
  );
  const rows = (await response.json()) as Array<{ id: string }>;
  if (!rows[0]?.id) throw new Error("Render artifact insert returned no ID.");
  return rows[0].id;
}

async function fetchArtifactsForJob(jobId: string, userId: string): Promise<StoredArtifact[]> {
  const response = await requireSupabaseResponse(
    `/rest/v1/render_artifacts?render_job_id=eq.${encodeURIComponent(jobId)}&user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.asc`,
    { method: "GET" },
    "Existing artifact lookup",
  );
  const rows = (await response.json()) as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: String(row.id),
    uri: String(row.uri ?? ""),
    format: String(row.format ?? ""),
    backend: String(row.backend ?? ""),
    bytes: Number(row.byte_size ?? row.bytes ?? 0),
    mimeType: String(row.mime_type ?? "application/octet-stream"),
    storageBucket: String(row.storage_bucket ?? "codex-exports"),
    storagePath: String(row.storage_path ?? ""),
    hash: String(row.content_hash ?? ""),
    targetStatus: String(row.target_status ?? "success") as RenderArtifact["targetStatus"],
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {},
  }));
}

async function readTrustedArtifactBytes(path: string, outputDirectory: string): Promise<Buffer> {
  const root = resolve(outputDirectory);
  const absolute = resolve(path);
  const relation = relative(root, absolute);
  if (relation.startsWith("..") || resolve(root, relation) !== absolute) {
    throw new Error("Renderer returned an artifact path outside its job directory.");
  }
  return readFile(absolute);
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise<T>((resolvePromise, rejectPromise) => {
    const timer = setTimeout(
      () => rejectPromise(new Error(`Rendering exceeded ${milliseconds}ms.`)),
      milliseconds,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolvePromise(value);
      },
      (error) => {
        clearTimeout(timer);
        rejectPromise(error);
      },
    );
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  configureCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
  }

  let jobId: string | undefined;
  let authUser: { id: string; email: string } | null = null;
  let userId: string | undefined;
  const startedAt = Date.now();

  try {
    ensurePersistenceConfigured();
    authUser = await getAuthUser(req);
    if (!authUser) {
      throw new RenderHttpError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    }
    userId = await resolveRenderUserId(authUser);

    const body = parseRequestBody(req);
    const targets = (body.targets ?? defaultTargets()) as RenderTarget[];
    const { verified, unavailable } = classifyTargets(targets);
    const resolved = await resolveSceneGraph(body, userId);
    const validationDiagnostics = validateSceneGraph(resolved.sceneGraph);
    if (validationDiagnostics.some((diagnostic) => diagnostic.severity === "fatal")) {
      throw new RenderHttpError(422, "SCENE_GRAPH_INVALID", "Scene graph validation failed.", {
        diagnostics: validationDiagnostics,
      });
    }

    const graphFingerprint = createHash("sha256")
      .update(JSON.stringify(resolved.sceneGraph))
      .digest("hex");
    const clientKey =
      body.idempotencyKey ??
      (typeof req.headers["idempotency-key"] === "string"
        ? req.headers["idempotency-key"]
        : undefined);
    const idempotencyKey = renderIdempotencyKey({
      sourceFamily: resolved.sourceFamily,
      sourceId: resolved.sourceId,
      targetFormats: targets.map((target) => target.format),
      userId,
      graphFingerprint,
      clientKey,
    });
    const existing = await findExistingRenderJob(idempotencyKey, userId);
    if (existing) {
      return res.status(200).json({
        ok: existing.status === "ready",
        reused: true,
        job: {
          id: existing.id,
          graphId: existing.graph_id,
          status: existing.status,
        },
        artifacts: await fetchArtifactsForJob(existing.id, userId),
        diagnostics: Array.isArray(existing.diagnostics) ? existing.diagnostics : [],
        manifest: existing.manifest ?? {},
      });
    }

    const sourceRef: ArtifactSourceRef = {
      sourceFamily: resolved.sourceFamily,
      sourceId: resolved.sourceId,
      userId,
      lifecycleState: "draft",
    };
    jobId = randomUUID();
    try {
      await createRenderJobRow({
        jobId,
        graphId: resolved.sceneGraph.graphId,
        userId,
        sourceFamily: sourceRef.sourceFamily,
        sourceId: sourceRef.sourceId,
        sceneGraph: resolved.sceneGraph,
        targets,
        idempotencyKey,
      });
    } catch (insertError) {
      const raced = await findExistingRenderJob(idempotencyKey, userId);
      if (!raced) throw insertError;
      jobId = undefined;
      return res.status(200).json({
        ok: raced.status === "ready",
        reused: true,
        job: {
          id: raced.id,
          graphId: raced.graph_id,
          status: raced.status,
        },
        artifacts: await fetchArtifactsForJob(raced.id, userId),
        diagnostics: Array.isArray(raced.diagnostics) ? raced.diagnostics : [],
        manifest: raced.manifest ?? {},
      });
    }

    const diagnostics: RenderDiagnostic[] = [
      ...validationDiagnostics,
      ...unavailableTargetDiagnostics(unavailable),
    ];
    const artifacts: StoredArtifact[] = [];
    const producedTargets = new Map<
      string,
      "success" | "failed" | "unsupported" | "partial"
    >();

    if (verified.length > 0) {
      await updateRenderJobStatus(jobId, userId, "rendering", diagnostics, {});
      const outputDirectory = join(tmpdir(), "gestaltview-render", jobId);
      const renderResult = await withTimeout(
        new GestaltRenderEngine().render({
          jobId,
          graph: resolved.sceneGraph,
          outputDirectory,
          targets: verified.map((target) => ({
            format: target.format,
            uri: `sink://${jobId}/${target.format}`,
            width: target.width,
            height: target.height,
            quality: target.quality,
            required: target.required,
          })),
        }),
        SYNC_TIMEOUT_MS,
      );
      diagnostics.push(...renderResult.diagnostics);
      await updateRenderJobStatus(jobId, userId, "storing", diagnostics, {});

      const sink = new SupabaseArtifactSink(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      for (const artifact of renderResult.artifacts) {
        try {
          const bytes = await readTrustedArtifactBytes(artifact.uri, outputDirectory);
          const internalManifest = artifact.metadata?.internalManifest === true;
          const stored = await sink.store(bytes, {
            jobId,
            graphId: resolved.sceneGraph.graphId,
            userId,
            format: artifact.format,
            mimeType: artifact.mimeType ?? mimeTypeForFormat(artifact.format),
            backend: artifact.backend,
            filename: basename(artifact.uri),
            metadata: artifact.metadata,
          });
          const targetStatus =
            artifact.metadata?.isPlaceholder === true ? "partial" : "success";
          const storedWithStatus: RenderArtifact = {
            ...stored,
            targetStatus,
          };
          const id = await createRenderArtifactRow({
            renderJobId: jobId,
            userId,
            artifact: storedWithStatus,
          });
          artifacts.push({ ...storedWithStatus, id });
          if (!internalManifest) {
            producedTargets.set(stored.format.toLowerCase(), targetStatus);
          }
        } catch (error) {
          diagnostics.push({
            code: "ARTIFACT_PERSISTENCE_FAILED",
            message: error instanceof Error ? error.message : String(error),
            severity: "fatal",
            stage: "storing",
            details: { format: artifact.format, backend: artifact.backend },
          });
        }
      }
    }

    const targetReceipts = targets.map((target) => {
      const format = target.format.toLowerCase();
      const producedStatus = producedTargets.get(format);
      return {
        format,
        required: target.required,
        status: producedStatus
          ? producedStatus
          : VERIFIED_SYNC_FORMATS.has(format)
            ? "failed"
            : "unsupported",
      };
    });
    const requiredTargetFailed = targetReceipts.some(
      (receipt) => receipt.required && receipt.status !== "success",
    );
    const hasFatal = diagnostics.some((diagnostic) => diagnostic.severity === "fatal");
    const finalStatus: RenderJobState = requiredTargetFailed || hasFatal ? "failed" : "ready";
    const manifest = {
      contract: "gestaltview.render-result.v2",
      engine: "shared/rendering/engine",
      graphId: resolved.sceneGraph.graphId,
      source: {
        family: resolved.sourceFamily,
        id: resolved.sourceId,
      },
      durationMs: Date.now() - startedAt,
      targetReceipts,
      artifactCount: artifacts.length,
      generatedAt: new Date().toISOString(),
    };
    await updateRenderJobStatus(jobId, userId, finalStatus, diagnostics, manifest);

    return res.status(finalStatus === "ready" ? 200 : 422).json({
      ok: finalStatus === "ready",
      reused: false,
      job: {
        id: jobId,
        graphId: resolved.sceneGraph.graphId,
        status: finalStatus,
      },
      artifacts,
      diagnostics,
      manifest,
    });
  } catch (error) {
    const status =
      error instanceof RenderHttpError
        ? error.status
        : error instanceof RenderUserResolutionError
          ? 409
          : 500;
    const code =
      error instanceof RenderHttpError
        ? error.code
        : error instanceof RenderUserResolutionError
          ? error.code
          : "RENDER_EXECUTION_FAILED";
    const message =
      error instanceof RenderHttpError
        ? error.message
        : error instanceof RenderUserResolutionError
          ? error.message
        : "The render request failed before a trustworthy completion receipt was written.";
    const details = error instanceof RenderHttpError ? error.details : undefined;

    if (jobId && userId) {
      const diagnostic: RenderDiagnostic = {
        code,
        message: error instanceof Error ? error.message : String(error),
        severity: "fatal",
        stage: "rendering",
      };
      await updateRenderJobStatus(jobId, userId, "failed", [diagnostic], {
        durationMs: Date.now() - startedAt,
        failedAt: new Date().toISOString(),
      }).catch(() => undefined);
    }

    return res.status(status).json({
      ok: false,
      error: { code, message, ...(details ? { details } : {}) },
      ...(jobId ? { job: { id: jobId, status: "failed" } } : {}),
    });
  }
}
