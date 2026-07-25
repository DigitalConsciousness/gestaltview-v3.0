import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuthUser } from "../_lib/auth.js";
import { RenderUserResolutionError, resolveRenderUserId } from "./user-id.js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";
const DOWNLOAD_TTL_SECONDS = 300;

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

function safeJsonValue(value: unknown, fallback: unknown): unknown {
  if (typeof value !== "string") return value ?? fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function encodeStoragePath(path: string): string {
  return path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

async function createSignedUrl(bucket: string, path: string): Promise<string | null> {
  if (!bucket || !path) return null;
  const response = await supabaseRequest(
    `/storage/v1/object/sign/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`,
    {
      method: "POST",
      body: JSON.stringify({ expiresIn: DOWNLOAD_TTL_SECONDS }),
    },
  );
  if (!response.ok) return null;
  const payload = (await response.json()) as {
    signedURL?: string;
    signedUrl?: string;
  };
  const signed = payload.signedURL ?? payload.signedUrl;
  if (!signed) return null;
  if (/^https?:\/\//i.test(signed)) return signed;
  return `${SUPABASE_URL}/storage/v1${signed.startsWith("/") ? signed : `/${signed}`}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
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

    const jobId = String(req.query.jobId ?? "");
    if (!jobId) {
      return res.status(400).json({
        ok: false,
        error: { code: "JOB_ID_REQUIRED", message: "jobId is required." },
      });
    }

    const jobResponse = await supabaseRequest(
      `/rest/v1/render_jobs?id=eq.${encodeURIComponent(jobId)}&user_id=eq.${encodeURIComponent(userId)}&select=id,status,graph_id,diagnostics,manifest,created_at,updated_at&limit=1`,
    );
    if (!jobResponse.ok) {
      throw new Error(`Render job lookup failed (${jobResponse.status}).`);
    }
    const jobs = (await jobResponse.json()) as Array<Record<string, unknown>>;
    const job = jobs[0];
    if (!job) {
      return res.status(404).json({
        ok: false,
        error: { code: "RENDER_JOB_NOT_FOUND", message: "Render job not found." },
      });
    }

    const artifactResponse = await supabaseRequest(
      `/rest/v1/render_artifacts?render_job_id=eq.${encodeURIComponent(jobId)}&user_id=eq.${encodeURIComponent(userId)}&select=id,format,mime_type,backend,storage_bucket,storage_path,byte_size,bytes,content_hash,target_status,metadata,created_at&order=created_at.asc`,
    );
    if (!artifactResponse.ok) {
      throw new Error(`Render artifact lookup failed (${artifactResponse.status}).`);
    }
    const artifactRows = (await artifactResponse.json()) as Array<Record<string, unknown>>;
    const artifacts = await Promise.all(
      artifactRows.map(async (artifact) => {
        const bucket = String(artifact.storage_bucket ?? "codex-exports");
        const storagePath = String(artifact.storage_path ?? "");
        return {
          id: String(artifact.id),
          format: String(artifact.format),
          mimeType: String(artifact.mime_type ?? "application/octet-stream"),
          backend: String(artifact.backend ?? ""),
          bytes: Number(artifact.byte_size ?? artifact.bytes ?? 0),
          hash: String(artifact.content_hash ?? ""),
          targetStatus: String(artifact.target_status ?? "success"),
          metadata: safeJsonValue(artifact.metadata, {}),
          downloadUrl: await createSignedUrl(bucket, storagePath),
          downloadExpiresInSeconds: DOWNLOAD_TTL_SECONDS,
        };
      }),
    );

    const diagnostics = safeJsonValue(job.diagnostics, []);
    const manifest = safeJsonValue(job.manifest, {});
    return res.status(200).json({
      ok: true,
      job: {
        id: String(job.id),
        status: String(job.status),
        graphId: String(job.graph_id),
        createdAt: String(job.created_at),
        updatedAt: String(job.updated_at),
      },
      artifacts,
      diagnostics: Array.isArray(diagnostics) ? diagnostics : [],
      manifest: manifest && typeof manifest === "object" ? manifest : {},
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
        code: "RENDER_STATUS_UNAVAILABLE",
        message: "Render status could not be read from the durable ledger.",
      },
    });
  }
}
