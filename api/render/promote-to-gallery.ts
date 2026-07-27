import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { getAuthUser } from "../_lib/auth.js";
import { RenderUserResolutionError, resolveRenderUserId } from "./user-id.js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";
const MAX_PROJECTED_HTML_BYTES = 5_000_000;
const TRUSTED_HTML_BACKENDS = new Set(["gestalt-document-backend"]);

const requestSchema = z.object({
  renderJobId: z.string().uuid(),
  targetRoom: z.enum([
    "blackboard",
    "creation_corner",
    "dynamic_inner_world",
    "external_scaffold",
    "unknown",
  ]).default("dynamic_inner_world"),
  title: z.string().trim().min(1).max(240).optional(),
  summary: z.string().trim().max(1_000).optional(),
}).strict();

function ensureConfigured(): void {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Render persistence is not configured.");
  }
}

async function supabaseRequest(path: string, init: RequestInit = {}): Promise<Response> {
  ensureConfigured();
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

function encodeStoragePath(path: string): string {
  return path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

async function downloadStoredHtml(
  bucket: string,
  path: string,
): Promise<{ html: string; byteSize: number; contentHash: string }> {
  const response = await supabaseRequest(
    `/storage/v1/object/authenticated/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`,
    { method: "GET" },
  );
  if (!response.ok) {
    throw new Error(`Stored HTML download failed (${response.status}).`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_PROJECTED_HTML_BYTES) {
    throw new Error("Stored HTML exceeds the gallery projection limit.");
  }
  return {
    html: new TextDecoder().decode(bytes),
    byteSize: bytes.byteLength,
    contentHash: createHash("sha256").update(bytes).digest("hex"),
  };
}

function parseJsonObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  return {};
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
  }

  try {
    ensureConfigured();
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return res.status(401).json({
        ok: false,
        error: { code: "AUTHENTICATION_REQUIRED", message: "Authentication is required." },
      });
    }
    const userId = await resolveRenderUserId(authUser);

    let raw: unknown;
    try {
      raw = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
      return res.status(400).json({
        ok: false,
        error: { code: "INVALID_JSON", message: "The request body is not valid JSON." },
      });
    }
    const parsed = requestSchema.safeParse(raw);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: {
          code: "INVALID_REQUEST",
          message: "The promotion request is invalid.",
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      });
    }
    const body = parsed.data;

    const jobResponse = await supabaseRequest(
      `/rest/v1/render_jobs?id=eq.${encodeURIComponent(body.renderJobId)}&user_id=eq.${encodeURIComponent(userId)}&select=id,status,graph_id,manifest&limit=1`,
    );
    if (!jobResponse.ok) throw new Error("Render job lookup failed.");
    const jobs = (await jobResponse.json()) as Array<Record<string, unknown>>;
    const job = jobs[0];
    if (!job) {
      return res.status(404).json({
        ok: false,
        error: { code: "RENDER_JOB_NOT_FOUND", message: "Render job not found." },
      });
    }
    if (job.status !== "ready") {
      return res.status(409).json({
        ok: false,
        error: {
          code: "RENDER_JOB_NOT_READY",
          message: `Render job is ${String(job.status)}, not ready.`,
        },
      });
    }

    const artifactResponse = await supabaseRequest(
      `/rest/v1/render_artifacts?render_job_id=eq.${encodeURIComponent(body.renderJobId)}&user_id=eq.${encodeURIComponent(userId)}&select=id,format,mime_type,backend,storage_bucket,storage_path,byte_size,content_hash,target_status,metadata&order=created_at.asc`,
    );
    if (!artifactResponse.ok) throw new Error("Render artifact lookup failed.");
    const artifacts = (await artifactResponse.json()) as Array<Record<string, unknown>>;
    const htmlArtifacts = artifacts.filter(
      (artifact) =>
        String(artifact.mime_type ?? "").startsWith("text/html") &&
        TRUSTED_HTML_BACKENDS.has(String(artifact.backend ?? "")) &&
        String(artifact.target_status ?? "") === "success" &&
        Number(artifact.byte_size ?? 0) > 0 &&
        /^[a-f0-9]{64}$/i.test(String(artifact.content_hash ?? "")) &&
        Boolean(String(artifact.storage_path ?? "")),
    );

    const projectedIds: string[] = [];
    const skipped: Array<{ artifactId: string; reason: string }> = artifacts
      .filter((artifact) => !htmlArtifacts.includes(artifact))
      .map((artifact) => ({
        artifactId: String(artifact.id),
        reason: "Only verified document-backend HTML is gallery-projectable.",
      }));

    for (const artifact of htmlArtifacts) {
      const artifactId = String(artifact.id);
      const sourceRef = `render-artifact:${artifactId}`;
      const existingResponse = await supabaseRequest(
        `/rest/v1/inner_world_artifacts?user_id=eq.${encodeURIComponent(userId)}&source_ref=eq.${encodeURIComponent(sourceRef)}&select=id&limit=1`,
      );
      if (!existingResponse.ok) throw new Error("Projection idempotency lookup failed.");
      const existing = (await existingResponse.json()) as Array<{ id: string }>;
      if (existing[0]?.id) {
        projectedIds.push(existing[0].id);
        continue;
      }

      const bucket = String(artifact.storage_bucket ?? "codex-exports");
      const storagePath = String(artifact.storage_path ?? "");
      if (!storagePath) {
        skipped.push({ artifactId, reason: "Artifact has no durable storage path." });
        continue;
      }
      const downloaded = await downloadStoredHtml(bucket, storagePath);
      if (
        downloaded.byteSize !== Number(artifact.byte_size) ||
        downloaded.contentHash !== String(artifact.content_hash).toLowerCase()
      ) {
        skipped.push({
          artifactId,
          reason: "Stored bytes do not match the durable render receipt.",
        });
        continue;
      }
      const html = downloaded.html;
      if (!/<!doctype html|<html[\s>]/i.test(html)) {
        skipped.push({ artifactId, reason: "Stored artifact is not a complete HTML document." });
        continue;
      }

      const insertResponse = await supabaseRequest("/rest/v1/inner_world_artifacts", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          user_id: userId,
          title: body.title ?? `Render: ${String(job.graph_id)}`,
          summary: body.summary ?? `Rendered from ${String(job.graph_id)}`,
          html,
          origin_room: body.targetRoom,
          evidence_node_ids: [],
          tags: ["render-fold-in", `format:${String(artifact.format ?? "html")}`],
          content_type: "text/html",
          content_ref: {
            renderJobId: body.renderJobId,
            renderArtifactId: artifactId,
            storageBucket: bucket,
            storagePath,
          },
          source_ref: sourceRef,
          status: "ready",
        }),
      });
      if (!insertResponse.ok) {
        throw new Error(`Gallery projection insert failed (${insertResponse.status}).`);
      }
      const rows = (await insertResponse.json()) as Array<{ id: string }>;
      if (!rows[0]?.id) throw new Error("Gallery projection returned no ID.");
      projectedIds.push(rows[0].id);
    }

    if (projectedIds.length === 0) {
      return res.status(422).json({
        ok: false,
        projectedIds,
        skipped,
        error: {
          code: "NO_PROJECTABLE_HTML",
          message: "No verified complete HTML artifact could be projected.",
        },
      });
    }

    const manifest = {
      ...parseJsonObject(job.manifest),
      galleryProjection: {
        targetRoom: body.targetRoom,
        projectedIds,
        skipped,
        projectedAt: new Date().toISOString(),
      },
    };
    const updateResponse = await supabaseRequest(
      `/rest/v1/render_jobs?id=eq.${encodeURIComponent(body.renderJobId)}&user_id=eq.${encodeURIComponent(userId)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ manifest, updated_at: new Date().toISOString() }),
      },
    );
    if (!updateResponse.ok) throw new Error("Projection receipt update failed.");

    return res.status(200).json({
      ok: true,
      projectedIds,
      skipped,
      targetRoom: body.targetRoom,
      idempotent: projectedIds.length > 0,
    });
  } catch (error) {
    if (error instanceof RenderUserResolutionError) {
      return res.status(409).json({
        ok: false,
        error: { code: error.code, message: error.message },
      });
    }
    return res.status(503).json({
      ok: false,
      error: {
        code: "GALLERY_PROMOTION_FAILED",
        message: "The artifact was not promoted because a trustworthy projection receipt could not be written.",
      },
    });
  }
}
