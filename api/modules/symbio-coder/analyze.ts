// © 2026 Keith Soyka — GestaltView
// Symbio Coder API — Analyze endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createResponse } from '../../_lib/response';
import { analyzeCode } from './_lib/codeEngine';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, language } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required' });

    const analysis = analyzeCode(code, language ?? 'typescript');

    return res.status(200).json(createResponse(analysis, 'internal'));
  } catch (err) {
    console.error('[symbio-coder/analyze]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
