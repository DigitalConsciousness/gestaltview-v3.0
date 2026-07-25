import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRenderer, SUPPORTED_ARTIFACT_KINDS } from '../../shared/rendering/index.js';

/**
 * POST /api/gen-engine/render-decide
 *
 * Accepts an artifact kind, content, and desired output format;
 * dispatches to the correct renderer from shared/rendering/index.ts;
 * and returns the rendered artifact.
 *
 * Request body:
 *   {
 *     artifactKind : string   — one of the keys in RENDERERS map
 *     content      : unknown  — the input to the renderer
 *     format       : string   — desired output format (e.g. 'html', 'pdf', 'json')
 *   }
 *
 * Response:
 *   - html/json artifacts  → 200 text/html or application/json
 *   - binary (pdf/png/wav/mp3) → 200 application/octet-stream with
 *     Content-Disposition: attachment
 *   - unknown kind         → 400 with supported kinds list
 *   - unsupported format   → 422 with supported formats list
 *   - render error         → 500 with error message
 *
 * CORS: Accepts requests from the configured CORS_ORIGINS env var.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const origin = req.headers['origin'] as string | undefined;
  const allowedOrigins = (process.env['CORS_ORIGINS'] ?? '').split(',').map((s) => s.trim());
  if (origin && allowedOrigins.some((o) => origin.startsWith(o.replace(/\/$/, '')))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0] ?? '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const { artifactKind, content, format } = req.body as {
    artifactKind?: string;
    content?: unknown;
    format?: string;
  };

  if (!artifactKind) {
    res.status(400).json({
      error: 'Missing required field: artifactKind',
      supportedKinds: SUPPORTED_ARTIFACT_KINDS,
    });
    return;
  }

  if (!format) {
    res.status(400).json({ error: 'Missing required field: format' });
    return;
  }

  const renderer = getRenderer(artifactKind);

  if (!renderer) {
    res.status(400).json({
      error: `No renderer found for artifactKind: "${artifactKind}"`,
      supportedKinds: SUPPORTED_ARTIFACT_KINDS,
    });
    return;
  }

  const supportedFormats = renderer.formats();
  if (!supportedFormats.includes(format)) {
    res.status(422).json({
      error: `Renderer "${artifactKind}" does not support format "${format}"`,
      supportedFormats,
    });
    return;
  }

  try {
    const artifact = await renderer.render(content as never, format);

    if (Buffer.isBuffer(artifact.data)) {
      const mimeMap: Record<string, string> = {
        pdf: 'application/pdf',
        png: 'image/png',
        wav: 'audio/wav',
        mp3: 'audio/mpeg',
      };
      const mime = mimeMap[format] ?? 'application/octet-stream';
      res.setHeader('Content-Type', mime);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="artifact.${format}"`,
      );
      res.status(200).send(artifact.data);
      return;
    }

    if (format === 'html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(artifact.data);
      return;
    }

    res.status(200).json({
      format: artifact.format,
      data: artifact.data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[render-decide] Render error:', message);
    res.status(500).json({ error: `Render failed: ${message}` });
  }
}
