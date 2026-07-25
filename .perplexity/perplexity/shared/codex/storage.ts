import { createClient } from "@supabase/supabase-js";

type StoreExportParams = {
  bucket: string;
  path: string;
  bytes: Buffer;
  contentType: string;
  isPublic: boolean;
};

function readSupabaseConfig(): { url: string; key: string } {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for Codex storage.");
  }

  return { url, key };
}

export async function storeExport(params: StoreExportParams): Promise<{ url: string; signed: boolean }> {
  const { bucket, path, bytes, contentType, isPublic } = params;
  const { url, key } = readSupabaseConfig();
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const storage = (supabase as any).storage;
  const { error: uploadError } = await storage.from(bucket).upload(path, bytes, {
    contentType,
    cacheControl: "3600",
    upsert: false,
    metadata: { producedBy: "codex" },
  });

  if (uploadError) {
    throw uploadError;
  }

  if (isPublic) {
    const { data } = storage.from(bucket).getPublicUrl(path);
    return { url: data.publicUrl, signed: false };
  }

  const { data, error } = await storage.from(bucket).createSignedUrl(path, 60 * 60);
  if (error) {
    throw error;
  }

  return { url: data.signedUrl, signed: true };
}
