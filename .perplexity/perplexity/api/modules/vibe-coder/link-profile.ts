// © 2026 Keith Soyka — GestaltView
// Vibe Coder API — Link vibe to user PLK profile
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createResponse } from '../../_lib/response';
import { nanoid } from 'nanoid';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, vibeId } = req.body;
    if (!userId || !vibeId) {
      return res.status(400).json({ error: 'userId and vibeId are required' });
    }

    // TODO: Upsert music_dna_resonance dimension in user_personality_dimensions
    // and link to PLK via shared/llm/plk.ts
    const dimensionId = nanoid();

    return res.status(200).json(
      createResponse({ linked: true, dimensionId }, 'internal')
    );
  } catch (err) {
    console.error('[vibe-coder/link-profile]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
