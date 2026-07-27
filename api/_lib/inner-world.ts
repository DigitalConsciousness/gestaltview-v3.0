import { createClient } from "@supabase/supabase-js";

function envValue(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

let cachedClient: any = null;
let ensureBucketPromise: Promise<void> | null = null;

export function hasInnerWorldSupabaseConfig(): boolean {
  return Boolean(
    envValue("SUPABASE_URL", "VITE_SUPABASE_URL") &&
      envValue("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY")
  );
}

export function getInnerWorldSupabaseAdmin(): any {
  if (cachedClient) {
    return cachedClient;
  }

  const url = envValue("SUPABASE_URL", "VITE_SUPABASE_URL");
  const key = envValue("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY");

  if (!url || !key) {
    throw new Error("Supabase is not configured for inner world persistence.");
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

export function getInnerWorldStorageBucket(): string {
  return envValue("INNER_WORLD_STORAGE_BUCKET") || "user-files";
}

export function getInnerWorldSignedUrlTtlSeconds(): number {
  const raw = Number(envValue("INNER_WORLD_SIGNED_URL_TTL_SECONDS"));
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 60 * 60;
}

export function detectFileKindFromNameAndMime(name: string, mimeType = ""): "markdown" | "html" | "pdf" | "text" | "image" | "audio" | "video" | "binary" {
  const lowerName = name.toLowerCase();
  const lowerMime = mimeType.toLowerCase();

  if (lowerName.endsWith(".md") || lowerName.endsWith(".markdown") || lowerMime.includes("markdown")) return "markdown";
  if (lowerName.endsWith(".html") || lowerName.endsWith(".htm") || lowerMime.includes("html")) return "html";
  if (lowerName.endsWith(".pdf") || lowerMime === "application/pdf") return "pdf";
  if (lowerMime.startsWith("image/")) return "image";
  if (lowerMime.startsWith("audio/")) return "audio";
  if (lowerMime.startsWith("video/")) return "video";
  if (lowerMime.startsWith("text/") || ["application/json", "application/xml", "application/javascript", "application/typescript", "text/markdown", "text/csv"].includes(lowerMime)) {
    return "text";
  }

  return "binary";
}

export function storagePathForUserFile(userId: string, fileId: string, fileName: string): string {
  const safeName = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "file";
  return `user-files/${userId}/${fileId}/${safeName}`;
}

function parseDataUrl(dataUrl: string): { buffer: Buffer; contentType: string } {
  const match = /^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.+)$/i.exec(dataUrl.trim());
  if (!match) {
    return { buffer: Buffer.from(dataUrl, "utf8"), contentType: "application/octet-stream" };
  }

  return {
    buffer: Buffer.from(match[2] ?? "", "base64"),
    contentType: match[1] || "application/octet-stream",
  };
}

async function ensureBucket(): Promise<void> {
  if (ensureBucketPromise) {
    return ensureBucketPromise;
  }

  ensureBucketPromise = (async () => {
    const supabase = getInnerWorldSupabaseAdmin();
    const bucket = getInnerWorldStorageBucket();
    const { error } = await supabase.storage.createBucket(bucket, { public: false });
    if (error) {
      const message = `${error.message ?? error}`.toLowerCase();
      if (!message.includes("already exists") && !message.includes("duplicate") && !message.includes("conflict")) {
        throw new Error(`Failed to ensure storage bucket "${bucket}": ${error.message ?? error}`);
      }
    }
  })();

  return ensureBucketPromise;
}

export async function uploadInnerWorldFileObject(input: {
  storagePath: string;
  contentType: string;
  content?: string | null;
  dataUrl?: string | null;
}): Promise<void> {
  await ensureBucket();
  const supabase = getInnerWorldSupabaseAdmin();
  const bucket = getInnerWorldStorageBucket();
  const bytes =
    input.dataUrl?.trim()
      ? parseDataUrl(input.dataUrl).buffer
      : Buffer.from(input.content ?? "", "utf8");

  const { error } = await supabase.storage.from(bucket).upload(input.storagePath, bytes, {
    contentType: input.contentType || "application/octet-stream",
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    throw new Error(`Failed to upload file object: ${error.message ?? error}`);
  }
}

export async function removeInnerWorldFileObject(storagePath: string): Promise<void> {
  await ensureBucket();
  const supabase = getInnerWorldSupabaseAdmin();
  const bucket = getInnerWorldStorageBucket();
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);
  if (error) {
    throw new Error(`Failed to remove file object: ${error.message ?? error}`);
  }
}

export async function createInnerWorldSignedUrl(storagePath: string): Promise<string | null> {
  await ensureBucket();
  const supabase = getInnerWorldSupabaseAdmin();
  const bucket = getInnerWorldStorageBucket();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, getInnerWorldSignedUrlTtlSeconds());
  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

export async function buildInnerWorldFilePayload(row: {
  id: string;
  source_ref?: string | null;
  user_id: string;
  name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  room_origin: string;
  tags: string[] | null;
  preview_text: string | null;
  preview_html: string | null;
  created_at: string;
  updated_at: string;
}): Promise<Record<string, unknown>> {
  const signedUrl = await createInnerWorldSignedUrl(row.storage_path);
  return {
    id: row.source_ref ?? row.id,
    userId: row.user_id,
    name: row.name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    storagePath: row.storage_path,
    roomOrigin: row.room_origin,
    tags: row.tags ?? [],
    previewText: row.preview_text ?? undefined,
    previewHtml: row.preview_html ?? undefined,
    previewUrl: signedUrl ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    kind: detectFileKindFromNameAndMime(row.name, row.mime_type),
  };
}

export function buildInnerWorldArtifactPayload(row: {
  id: string;
  source_ref?: string | null;
  content_ref?: Record<string, unknown> | null;
  user_id: string;
  title: string;
  summary: string;
  source_file_id: string | null;
  source_file_ref?: string | null;
  html: string;
  thumbnail_url: string | null;
  origin_room: string;
  origin_di_id?: string | null;
  evidence_node_ids: string[] | null;
  tags: string[] | null;
  status?: string | null;
  created_at: string;
  updated_at: string;
}): Record<string, unknown> {
  return {
    id: row.source_ref ?? row.id,
    sourceRef: row.source_ref ?? undefined,
    contentRef: row.content_ref ?? undefined,
    userId: row.user_id,
    title: row.title,
    summary: row.summary,
    sourceFileId: row.source_file_ref ?? (row.source_file_id ? String(row.source_file_id) : null),
    html: row.html,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    originRoom: row.origin_room,
    originDiId: row.origin_di_id ?? undefined,
    evidenceNodeIds: row.evidence_node_ids ?? [],
    tags: row.tags ?? [],
    status: row.status ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
