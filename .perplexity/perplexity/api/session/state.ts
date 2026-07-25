import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionState } from '../_lib/rateLimit.js';
import { createHash } from 'crypto';

function buildSessionId(req: VercelRequest): string {
  const ip =
    (req.headers['x-real-ip'] as string) ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    'unknown';
  const ua = req.headers['user-agent'] || 'unknown';
  // Daily rotating fingerprint — not stored permanently
  const day = new Date().toISOString().slice(0, 10);
  return createHash('sha256').update(`${ip}:${ua}:${day}`).digest('hex').slice(0, 32);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = buildSessionId(req);
  const userId = req.headers['x-user-id'] as string | undefined;

  try {
    const state = await getSessionState(sessionId, userId);
    return res.status(200).json(state);
  } catch (err: unknown) {
    // Never fail hard — return a permissive anonymous state on error
    console.error('[session/state] Error:', err);
    return res.status(200).json({
      tier: 'anonymous',
      queryCount: 0,
      queryLimit: 2,
      remaining: 2,
      isLimited: false,
    });
  }
}
