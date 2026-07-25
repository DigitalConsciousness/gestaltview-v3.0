// api/gen-engine/artifacts.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createArtifact,
  getDefaultConsent,
  normalizeConsent,
} from '../../shared/gen-engine/index.js';
import type { ArtifactSynthesisRequest } from '../../shared/gen-engine/index.js';
import { bridgeToCodex } from '../_lib/codexBridge.js';
import { sendJson } from '../_lib/response.js';
import { prepareJsonRoute, readBody } from './_shared.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ['POST'])) return;

  const body = readBody<Partial<ArtifactSynthesisRequest>>(req);

  const result = createArtifact({
    sourceCaptureIds: Array.isArray(body.sourceCaptureIds) ? body.sourceCaptureIds : [],
    sourceArtifactIds: Array.isArray(body.sourceArtifactIds) ? body.sourceArtifactIds : [],
    targetType: body.targetType ?? 'markdown',
    synthesisStyle: body.synthesisStyle ?? 'faithful',
    destination: body.destination ?? 'download-only',
    userInstructions: body.userInstructions,
    preserveExactLanguage: Boolean(body.preserveExactLanguage),
    plkMode: body.plkMode ?? 'off',
    title: body.title,
    summary: body.summary,
    sourceText: body.sourceText,
    sourceRoom: body.sourceRoom,
    consent: body.consent ? normalizeConsent(body.consent) : getDefaultConsent(),
    tags: Array.isArray(body.tags) ? body.tags : [],
    userId: body.userId,
  });

  let codexWarnings: string[] = [];
  let codexArtifactId: string | null = null;

  try {
    const bridgeResult = await bridgeToCodex(result.artifact, result.provenance);
    codexArtifactId = bridgeResult.codex_artifact.id;
    codexWarnings = bridgeResult.warnings;
  } catch (err) {
    codexWarnings.push(`Codex bridge error: ${String(err)}`);
  }

  sendJson(res, 200, {
    ...result,
    codexArtifactId,
    warnings: [...(result.warnings ?? []), ...codexWarnings],
  });
}
