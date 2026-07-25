// © 2026 Keith Soyka — GestaltView
// Symbio Coder API — Suggest endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createResponse } from '../../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, language, suggestionType } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required' });
    if (!['explain', 'optimize', 'refactor'].includes(suggestionType)) {
      return res.status(400).json({ error: 'Invalid suggestionType' });
    }

    // TODO: Route through LLM router (shared/llm/router.ts)
    // const suggestion = await llmRouter.complete({ system: CODER_SYSTEM_PROMPT, prompt: CODER_PROMPTS[suggestionType](code, language) })
    const suggestion = `[${suggestionType.toUpperCase()} stub] LLM integration pending for: ${language} code (${code.split('\n').length} lines)`;

    return res.status(200).json(
      createResponse({ suggestion, suggestedCode: null, explanation: null }, 'internal')
    );
  } catch (err) {
    console.error('[symbio-coder/suggest]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
