// © 2026 Keith Soyka — GestaltView
// Vibe Coder API — Suggestions endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createResponse } from '../../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vibeId } = req.query;
    if (!vibeId) return res.status(400).json({ error: 'vibeId is required' });

    // TODO: Fetch stored vibe from Supabase, then route through LLM for personalized suggestions
    const suggestions = [
      { prompt: 'Write a poem that captures the emotional core of this song', action: 'Open Creation Corner' },
      { prompt: 'Describe a scene or memory this song conjures', action: 'Save to Journal' },
      { prompt: 'What creative project would this song soundtrack?', action: 'Start in Workspace' },
      { prompt: 'Which dimension of your identity does this song amplify?', action: 'Explore in Dynamic Inner World' },
    ];

    return res.status(200).json(createResponse({ suggestions }, 'internal'));
  } catch (err) {
    console.error('[vibe-coder/suggestions]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
