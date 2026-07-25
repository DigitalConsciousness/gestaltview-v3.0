// api/gen-engine/export.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { exportArtifact } from '../../shared/gen-engine/index.js';
import type { GeneratedArtifact, ArtifactExportFormat } from '../../shared/gen-engine/types.js';
import { sendJson } from '../_lib/response.js';
import { prepareJsonRoute, readBody } from './_shared.js';

interface ExportRequest {
  artifact: GeneratedArtifact;
  format?: ArtifactExportFormat;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ['POST'])) return;

  const body = readBody<ExportRequest>(req);
  if (!body.artifact) {
    sendJson(res, 400, { error: 'artifact is required' });
    return;
  }

  const format: ArtifactExportFormat = body.format ?? body.artifact.contentFormat ?? 'markdown';
  const result = exportArtifact(body.artifact, format);

  if (format === 'html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.status(200).send(result.content);
    return;
  }

  sendJson(res, 200, {
    fileName: result.fileName,
    mimeType: result.mimeType,
    content: result.content,
    byteSize: Buffer.byteLength(result.content, 'utf8'),
    exportedAt: new Date().toISOString(),
  });
}
