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

/**
 * Strip the gen-engine prefix (e.g. "artifact-", "blueprint-") from an ID
 * to leave only the UUID portion. If the value is already a bare UUID, it is
 * returned unchanged. If no UUID segment can be found, returns null.
 */
function extractUuidSegment(id: string): string | null {
  // Match any 8-4-4-4-12 UUID within the string.
  const match = id.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  );
  return match ? match[0] : null;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toUuidArray(ids: string[]): string[] {
  return Array.from(
    new Set(
      ids
        .map((id) => extractUuidSegment(id))
        .filter((id): id is string => Boolean(id && UUID_PATTERN.test(id))),
    ),
  );
}

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

  // This is the UUID that will be written to created_artifacts.id.
  // All downstream references (including the FK in artifact_provenance_envelopes)
  // MUST use this value — not artifact.id which carries a gen-engine prefix.
  const codexId = crypto.randomUUID();

  // Preserve the original gen-engine ID as a text reference only.
  const genArtifactId = artifact.id;

  // Best-effort UUID extraction from the prefixed gen-engine ID for any
  // downstream code that needs a bare UUID reference to the gen artifact.
  const genArtifactUuid = extractUuidSegment(genArtifactId) ?? genArtifactId;

  const dbSourceCaptureIds = toUuidArray(artifact.sourceCaptureIds);
  const dbSourceArtifactIds = toUuidArray(artifact.sourceArtifactIds);

  const codex_artifact: CodexArtifact = {
    id: codexId,
    user_id: artifact.userId ?? null,
    gen_artifact_id: genArtifactId,
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

  // ── Step 1: Insert the artifact row ──────────────────────────────────────
  // created_artifacts.id is a UUID column — use codexId (bare UUID).
  // gen_artifact_id stored in metadata is a text field — safe to store prefixed.
  try {
    await insertRow('created_artifacts', {
      id: codexId,
      userid: codex_artifact.user_id,
      title: codex_artifact.title,
      artifacttype: codex_artifact.artifact_type,
      contentformat: codex_artifact.content_format,
      content: codex_artifact.content,
      sourcecaptureids: dbSourceCaptureIds,
      sourceartifactids: dbSourceArtifactIds,
      destination: codex_artifact.destination,
      metadata: {
        ...codex_artifact.metadata,
        // Store the prefixed gen-engine ID as text for tracing.
        gen_artifact_id: genArtifactId,
        // Also store the bare UUID portion for any FK/join needs.
        gen_artifact_uuid: genArtifactUuid,
        source_capture_ids: codex_artifact.source_capture_ids,
        source_artifact_ids: codex_artifact.source_artifact_ids,
        codex_version: CODEX_VERSION,
        status: codex_artifact.status,
        review_required: codex_artifact.review_required,
      },
      createdat: codex_artifact.created_at,
    });
  } catch (err) {
    warnings.push(`Supabase artifact persist failed: ${String(err)}`);
  }

  // ── Step 2: Insert the provenance envelope ────────────────────────────────
  // CRITICAL: artifactid here must match the UUID written to created_artifacts.id
  // above (codexId). The gen-engine provenance envelope carries artifact.id
  // (the prefixed string) as provenance.artifactId — that is intentional for
  // internal tracing but MUST NOT flow into this FK column.
  try {
    await insertRow('artifact_provenance_envelopes', {
      id: crypto.randomUUID(),
      // FK → created_artifacts.id — must be the same codexId inserted above.
      artifactid: codexId,
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
