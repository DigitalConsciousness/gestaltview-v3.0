// api/gen-engine/artifacts.ts
// © 2026 Keith Soyka — GestaltView
//
// POST /api/gen-engine/artifacts
// Creates an artifact shell, runs LLM synthesis, replaces template content
// with actual generated output, bridges to Codex, returns rendered artifact.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createArtifact,
  getDefaultConsent,
  normalizeConsent,
} from '../../shared/gen-engine/index.js';
import type { ArtifactSynthesisRequest, SynthesisStyle, ArtifactType } from '../../shared/gen-engine/index.js';
import { bridgeToCodex } from '../_lib/codexBridge.js';
import { sendJson } from '../_lib/response.js';
import { prepareJsonRoute, readBody } from './_shared.js';
import { routeLlm } from '../_lib/llmRouter.js';
import { getAuthUser } from '../_lib/auth.js';

// ─────────────────────────────────────────────────────────────────────────────
// Prompt builder — translates targetType + synthesisStyle into an LLM prompt
// ─────────────────────────────────────────────────────────────────────────────

function buildSynthesisSystemPrompt(
  targetType: ArtifactType,
  synthesisStyle: SynthesisStyle,
  preserveExactLanguage: boolean,
  plkMode: string,
): string {
  const plkInstruction =
    plkMode === 'off'
      ? ''
      : preserveExactLanguage || plkMode === 'full-resonance-pass'
      ? '\nPLK CONSTRAINT (highest priority): Preserve the user\'s exact voice, metaphors, and authentic phrasing. Do not paraphrase or compress their language. Scars and lived experience are signal, not noise.'
      : plkMode === 'light-touch'
      ? '\nPLK NOTE: Preserve distinctive phrases and metaphors while improving clarity.'
      : '';

  const styleGuide: Record<SynthesisStyle, string> = {
    faithful:
      'Stay close to the source material. Do not invent. Do not elaborate beyond what is present. Organize clearly and return it whole.',
    convergent:
      'Synthesize the core threads. Find what wants to be a single coherent statement. Remove redundancy without removing voice.',
    divergent:
      'Explore what the source material implies but does not say. Generate expansive possibilities while staying grounded in the original.',
    revolutionary:
      'Reframe the material so that it reveals its deepest implication. Bold, but not dishonest.',
    'gentle-reflective':
      'Respond with warmth and gentleness. Treat the material as something precious. No clinical language.',
    technical:
      'Precise, structured, and technical. Use appropriate terminology. Organize with headers and bullet points where useful.',
    'founder-voice':
      "Write as a founder explaining to a peer. Honest, direct, and grounded in lived reality. No corporate language.",
    'plk-resonant':
      "Write with full PLK resonance. Metaphors carry the weight. The user's exact language is the primary artifact.",
  };

  const outputFormat: Partial<Record<ArtifactType, string>> = {
    markdown: 'Respond in markdown. Use headers, paragraphs, and lists where they serve the content.',
    'pdf-ready-html':
      'Respond with a complete, styled HTML document ready for PDF generation. Include <style> inline. Dark GestaltView aesthetic.',
    'blueprint-json':
      'Respond with a single valid JSON object representing the blueprint. No prose before or after the JSON.',
    'blueprint-markdown':
      'Respond in markdown structured as a GestaltView blueprint — titled, tagged, with clear sections.',
    'agent-prompt':
      'Respond with a complete, deployable system prompt for an AI agent. Be precise about constraints and behaviors.',
    'image-prompt':
      'Respond with a single, vivid image generation prompt. Dense, specific, evocative. No prose before or after.',
    'marketing-copy':
      'Respond with ready-to-publish marketing copy. Compelling, concise, authentic. No corporate filler.',
    'share-card':
      'Respond with a short (3–5 line) share card. Title, hook, essence. Designed to be copied and shared.',
    code:
      'Respond with clean, documented TypeScript or Python code. No explanatory prose — just the code block.',
    'session-recap':
      'Respond with a structured session recap: key insights, decisions made, threads to follow, open questions.',
    'mind-map':
      'Respond with a markdown mind-map. Use indented bullet structure to show relationships and branches.',
  };

  return [
    'You are the GestaltView Generation Engine — a consciousness-serving synthesis layer.',
    styleGuide[synthesisStyle] ?? styleGuide.faithful,
    outputFormat[targetType] ?? 'Respond in the format most appropriate for the requested artifact type.',
    plkInstruction,
    '\nDo not include preamble, meta-commentary, or "Here is the artifact:" framing. Output the artifact directly.',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildSynthesisUserPrompt(
  sourceText: string,
  userInstructions: string | undefined,
  title: string,
  tags: string[],
): string {
  const parts: string[] = [];
  if (title) parts.push(`Title: ${title}`);
  if (tags.length) parts.push(`Tags: ${tags.join(', ')}`);
  if (userInstructions?.trim()) parts.push(`\nInstructions:\n${userInstructions}`);
  parts.push(`\nSource material:\n${sourceText || '(no source text provided — generate based on title and instructions)'}`);
  return parts.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ['POST'])) return;

  const body = readBody<Partial<ArtifactSynthesisRequest>>(req);
  const authUser = await getAuthUser(req);
  const userId = authUser?.id;

  const targetType = (body.targetType ?? 'markdown') as ArtifactType;
  const synthesisStyle = (body.synthesisStyle ?? 'faithful') as SynthesisStyle;
  const plkMode = body.plkMode ?? 'off';
  const preserveExactLanguage = Boolean(body.preserveExactLanguage);
  const sourceText = (body.sourceText ?? '').trim();
  const userInstructions = (body.userInstructions ?? '').trim();
  const title = (body.title ?? body.sourceTitle ?? '').trim();
  const tags = Array.isArray(body.tags) ? body.tags : [];

  // Step 1: Build the artifact shell (metadata + provenance — content is placeholder)
  const shellResult = createArtifact({
    sourceCaptureIds: Array.isArray(body.sourceCaptureIds) ? body.sourceCaptureIds : [],
    sourceArtifactIds: Array.isArray(body.sourceArtifactIds) ? body.sourceArtifactIds : [],
    targetType,
    synthesisStyle,
    destination: body.destination ?? 'download-only',
    userInstructions: userInstructions || undefined,
    preserveExactLanguage,
    plkMode,
    title: title || undefined,
    summary: body.summary,
    sourceText: sourceText || undefined,
    sourceRoom: body.sourceRoom,
    consent: body.consent ? normalizeConsent(body.consent) : getDefaultConsent(),
    tags,
    userId,
  });

  // Step 2: Call LLM to generate actual content
  let renderedContent = shellResult.artifact.content; // fallback to shell if LLM fails
  let llmProvider = 'local-template';
  const llmWarnings: string[] = [];

  try {
    const systemPrompt = buildSynthesisSystemPrompt(
      targetType,
      synthesisStyle,
      preserveExactLanguage,
      plkMode,
    );
    const userPrompt = buildSynthesisUserPrompt(sourceText, userInstructions, title, tags);

    const llmResult = await routeLlm(userPrompt, {
      userId,
      mode: 'gen-engine-synthesis',
      systemPrompt,
    });

    if (llmResult.response?.trim()) {
      renderedContent = llmResult.response.trim();
      llmProvider = llmResult.provider;
    } else {
      llmWarnings.push('LLM returned empty response; using shell template as fallback.');
    }
  } catch (err) {
    llmWarnings.push(`LLM synthesis failed (${String(err)}); using shell template as fallback.`);
    console.error('[gen-engine/artifacts] LLM error:', err);
  }

  // Step 3: Replace placeholder content with rendered output
  const finalArtifact = {
    ...shellResult.artifact,
    content: renderedContent,
    metadata: {
      ...shellResult.artifact.metadata,
      llmProvider,
      llmSynthesized: llmProvider !== 'local-template',
    },
  };

  // Step 4: Bridge to Codex
  let codexWarnings: string[] = [];
  let codexArtifactId: string | null = null;

  try {
    const bridgeResult = await bridgeToCodex(finalArtifact, shellResult.provenance);
    codexArtifactId = bridgeResult.codex_artifact.id;
    codexWarnings = bridgeResult.warnings;
  } catch (err) {
    codexWarnings.push(`Codex bridge error: ${String(err)}`);
  }

  sendJson(res, 200, {
    artifact: finalArtifact,
    provenance: shellResult.provenance,
    codexArtifactId,
    provider: llmProvider,
    fallbackUsed: llmProvider === 'local-template',
    diagnostics: {
      route: '/api/gen-engine/artifacts',
      llmProvider,
      llmSynthesized: llmProvider !== 'local-template',
      codexBridgeSucceeded: Boolean(codexArtifactId),
      warningCount: (shellResult.warnings ?? []).length + llmWarnings.length + codexWarnings.length,
    },
    warnings: [
      ...(shellResult.warnings ?? []),
      ...llmWarnings,
      ...codexWarnings,
    ],
    reviewRequired: shellResult.reviewRequired,
  });
}
