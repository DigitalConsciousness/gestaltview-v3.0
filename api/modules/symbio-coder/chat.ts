// © 2026 Keith Soyka — GestaltView
// Symbio Coder API — Chat endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createResponse } from '../../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, message, codeContext, language } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    // TODO: Route through LLM router with session memory
    // const reply = await llmRouter.chat({ sessionId, system: CODER_SYSTEM_PROMPT, message, context: codeContext })
    const reply = `[CHAT STUB] Symbio received: "${message}" — LLM integration pending (session: ${sessionId})`;

    return res.status(200).json(
      createResponse({ reply, suggestedEdits: null }, 'internal')
    );
  } catch (err) {
    console.error('[symbio-coder/chat]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
