// GestaltView v2 — Actions API Handler
// © 2026 Keith Soyka / GestaltView
//
// Unified actions endpoint for chat, consciousness, synthesis,
// bucket drops, musical DNA, and tribunal flows.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { routeLlm } from '../_lib/llmRouter';
import { envelope, sendJson } from '../_lib/response';
import { getUserId } from '../_lib/user';
import type { BillyTier } from '../../shared/billy/types';

interface SynthesisRequest {
  query?: string;
  message?: string;
  sectionId?: string;
  mode?: 'synthesize' | 'loom' | 'code';
  topK?: number;
  includeCorpus?: boolean;
  userContext?: Record<string, unknown>;
  userId?: string;
  userTier?: BillyTier;
}

interface BucketDropCreateRequest {
  content?: string;
  userId?: string;
  rawText?: string;
  captureContext?: Record<string, unknown>;
}

interface MusicalDNARequest {
  userId?: string;
  songTitle?: string;
  artist?: string;
}

interface TribunalRequest {
  userId?: string;
  question?: string;
  participants?: string[];
  userTier?: BillyTier;
}

function applyCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');
}

function normalizePath(req: VercelRequest): string {
  const slug = req.query.path;
  if (Array.isArray(slug)) return slug.join('/');
  if (typeof slug === 'string') return slug;
  return '';
}

function pathMatches(path: string, target: string): boolean {
  return path === target || path.startsWith(`${target}/`);
}

function normalizeTier(value: BillyTier | string | undefined): BillyTier {
  if (value === 'free' || value === 'core' || value === 'pro' || value === 'enterprise') {
    return value;
  }
  return 'anonymous';
}

async function buildAiEnvelope(req: VercelRequest, body: Record<string, unknown>, message: string, mode: string) {
  const userId = getUserId(req, body);
  const llm = await routeLlm(message, {
    userId,
    mode,
    exhibit: typeof body.exhibit === 'string' ? body.exhibit : undefined,
    plk: typeof body.plk === 'string' ? body.plk : undefined,
    tier: normalizeTier(typeof body.userTier === 'string' ? body.userTier : undefined),
  });

  return {
    ...envelope(llm.response, llm.provider, {
      free: llm.free,
      tokensUsed: llm.tokensUsed,
      processingTime: llm.processingTime,
      metadata: {
        ...(llm.metadata || {}),
        userId,
      },
    }),
    userId,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  applyCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const path = normalizePath(req);

  if (req.method === 'GET' && path === 'health') {
    sendJson(
      res,
      200,
      envelope('Actions API healthy', 'gestaltview-actions', {
        free: true,
        tokensUsed: null,
        processingTime: 0,
        metadata: { route: path },
      })
    );
    return;
  }

  if (req.method === 'POST' && (path === 'chat' || path === 'consciousness/reflect')) {
    const body = (req.body || {}) as Record<string, unknown>;
    const message = (typeof body.message === 'string' ? body.message : '').trim();
    if (!message) {
      sendJson(res, 400, { error: 'message is required' });
      return;
    }

    const mode = path === 'chat' ? 'chat' : 'consciousness';
    const result = await buildAiEnvelope(req, body, message, mode);
    sendJson(res, 200, result);
    return;
  }

  if (req.method === 'POST' && (path === 'billy/synthesize' || path === 'billy/loom' || path === 'billy/code')) {
    const body = (req.body || {}) as SynthesisRequest;
    const input = (body.message || body.query || '').trim();

    if (!input) {
      sendJson(res, 400, { error: 'message or query is required' });
      return;
    }

    const mode = path.endsWith('loom') ? 'loom' : path.endsWith('code') ? 'code' : body.mode || 'synthesize';
    const result = await buildAiEnvelope(req, body as Record<string, unknown>, input, mode);

    sendJson(res, 200, {
      ...result,
      metadata: {
        ...(result.metadata || {}),
        sectionId: body.sectionId || null,
        topK: Math.min(Math.max(body.topK || 4, 1), 12),
      },
    });
    return;
  }

  if (req.method === 'POST' && pathMatches(path, 'bucket-drops')) {
    const body = (req.body || {}) as BucketDropCreateRequest;
    const content = (body.content || '').trim();

    if (!content) {
      sendJson(res, 400, { error: 'content is required' });
      return;
    }

    const result = envelope('Bucket drop captured and preserved with original phrasing.', 'bucket-drop-capture', {
      free: true,
      tokensUsed: null,
      processingTime: 0,
      metadata: {
        userId: getUserId(req, body as Record<string, unknown>),
        bucketDrop: {
          content,
          rawText: body.rawText || null,
          captureContext: body.captureContext || null,
        },
      },
    });

    sendJson(res, 200, result);
    return;
  }

  if (req.method === 'POST' && pathMatches(path, 'musical-dna')) {
    const body = (req.body || {}) as MusicalDNARequest;
    if (!body.songTitle || !body.artist) {
      sendJson(res, 400, { error: 'songTitle and artist are required' });
      return;
    }

    const result = envelope('Musical DNA pattern mapped.', 'musical-dna', {
      free: true,
      tokensUsed: null,
      processingTime: 0,
      metadata: {
        userId: getUserId(req, body as Record<string, unknown>),
        songTitle: body.songTitle,
        artist: body.artist,
      },
    });

    sendJson(res, 200, result);
    return;
  }

  if (req.method === 'POST' && pathMatches(path, 'tribunal')) {
    const body = (req.body || {}) as TribunalRequest;
    const question = (body.question || '').trim();

    if (!question) {
      sendJson(res, 400, { error: 'question is required' });
      return;
    }

    const result = await buildAiEnvelope(req, body as Record<string, unknown>, question, 'tribunal');
    sendJson(res, 200, {
      ...result,
      metadata: {
        ...(result.metadata || {}),
        participants: body.participants || [],
      },
    });
    return;
  }

  sendJson(res, 404, { error: `Unknown action path: ${path}` });
}
