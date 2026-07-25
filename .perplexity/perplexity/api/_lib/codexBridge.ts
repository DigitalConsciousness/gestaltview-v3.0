// api/_lib/codexBridge.ts
import { insertRow } from './supabase.js';
import type { GeneratedArtifact, ProvenanceEnvelope } from '../../shared/gen-engine/types.js';

export type CodexArtifactStatus = 'draft' | 'validated' | 'export_queued' | 'exported' | 'failed';

export interface CodexArtifact {
  id: string;
  user_id: string | null;
  gen_artifact_id: string;
  title: string;
  artifact_type: string;
  content_format: string;
  content: string;
  destination: string;
  source_capture_ids: string[];
  source_artifact_ids: string[];
  provenance: ProvenanceEnvelope;
  metadata: Record<string, unknown>;
  status: CodexArtifactStatus;
  codex_version: string;
  review_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface CodexBridgeResult {
  codex_artifact: CodexArtifact;
  warnings: string[];
  validation_passed: boolean;
}

const CODEX_VERSION = '1.0.0';

function validateArtifactContract(artifact: GeneratedArtifact): string[] {
  const warnings: string[] = [];
  if (!artifact.id)
    warnings.push('artifact.id is missing — provenance chain will be incomplete');
  if (!artifact.content || artifact.content.trim().length === 0)
    warnings.push('artifact.content is empty — export will produce a blank document');
  if (!artifact.sourceCaptureIds || artifact.sourceCaptureIds.length === 0)
    warnings.push('no source capture IDs attached — provenance cannot be verified');
  if (!artifact.createdAt)
    warnings.push('artifact.createdAt is missing — timestamp will be inferred');
  return warnings;
}

export async function bridgeToCodex(
  artifact: GeneratedArtifact,
  provenance: ProvenanceEnvelope
): Promise<CodexBridgeResult> {
  const warnings = validateArtifactContract(artifact);
  const validation_passed = warnings.length === 0;

  const now = new Date().toISOString();
  const artifactId = crypto.randomUUID();

  const codex_artifact: CodexArtifact = {
    id: artifactId,
    user_id: artifact.userId ?? null,
    gen_artifact_id: artifact.id,
    title: artifact.title,
    artifact_type: artifact.type,
    content_format: artifact.contentFormat,
    content: artifact.content,
    destination: artifact.destination,
    source_capture_ids: artifact.sourceCaptureIds,
    source_artifact_ids: artifact.sourceArtifactIds,
    provenance,
    metadata: (artifact.metadata as Record<string, unknown>) ?? {},
    status: validation_passed ? 'validated' : 'draft',
    codex_version: CODEX_VERSION,
    review_required: Boolean((artifact.metadata as Record<string, unknown>)?.reviewRecommended),
    created_at: artifact.createdAt ?? now,
    updated_at: now,
  };

  try {
    await insertRow('created_artifacts', {
      id: codex_artifact.id,
      userid: codex_artifact.user_id,
      title: codex_artifact.title,
      artifacttype: codex_artifact.artifact_type,
      contentformat: codex_artifact.content_format,
      content: codex_artifact.content,
      sourcecaptureids: codex_artifact.source_capture_ids,
      sourceartifactids: codex_artifact.source_artifact_ids,
      destination: codex_artifact.destination,
      metadata: {
        ...codex_artifact.metadata,
        gen_artifact_id: codex_artifact.gen_artifact_id,
        codex_version: CODEX_VERSION,
        status: codex_artifact.status,
        review_required: codex_artifact.review_required,
      },
      createdat: codex_artifact.created_at,
    });
  } catch (err) {
    warnings.push(`Supabase artifact persist failed: ${String(err)}`);
  }

  try {
    await insertRow('artifact_provenance_envelopes', {
      id: crypto.randomUUID(),
      artifactid: artifactId,
      sourcehashes: provenance.sourceHashes,
      artifacthash: provenance.artifactHash,
      transformtype: provenance.transformType,
      engineversion: provenance.engineVersion,
      modelprovider: (provenance as Record<string, unknown>).modelProvider ?? null,
      modelname: (provenance as Record<string, unknown>).modelName ?? null,
      createdat: now,
    });
  } catch (err) {
    warnings.push(`Supabase provenance persist failed: ${String(err)}`);
  }

  return { codex_artifact, warnings, validation_passed };
}
