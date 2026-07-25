// api/gen-engine/artifact.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendJson } from '../_lib/response.js';
import { prepareJsonRoute } from './_shared.js';

async function fetchRow(table: string, filter: string): Promise<Record<string, unknown> | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? '';
  if (!url || !key) return null;

  const res = await fetch(
    `${url.replace(/\/+$/, '')}/rest/v1/${table}?${filter}&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
    }
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as Record<string, unknown>[];
  return rows[0] ?? null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ['GET'])) return;

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    sendJson(res, 400, { error: 'id query param is required' });
    return;
  }

  if (!process.env.SUPABASE_URL) {
    sendJson(res, 503, { error: 'Storage not configured' });
    return;
  }

  const artifact = await fetchRow('created_artifacts', `id=eq.${encodeURIComponent(id)}`);
  if (!artifact) {
    sendJson(res, 404, { error: 'Artifact not found' });
    return;
  }

  const provenance = await fetchRow(
    'artifact_provenance_envelopes',
    `artifactid=eq.${encodeURIComponent(id)}`
  );

  sendJson(res, 200, {
    artifact,
    provenance: provenance ?? null,
    retrievedAt: new Date().toISOString(),
  });
}
