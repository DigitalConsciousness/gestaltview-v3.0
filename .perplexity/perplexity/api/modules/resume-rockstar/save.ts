// © 2026 Keith Soyka — GestaltView
// Resume Rockstar API — Save endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createResponse } from '../../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, resume } = req.body;

    if (!resume?.resumeId) {
      return res.status(400).json({ error: 'resume.resumeId is required' });
    }

    // TODO: Persist to Supabase workspace_documents or resumes table
    // const { data, error } = await supabase
    //   .from('resumes')
    //   .upsert({ id: resume.resumeId, user_id: userId, ...resume })

    const savedAt = new Date().toISOString();

    return res.status(200).json(
      createResponse({ resumeId: resume.resumeId, savedAt }, 'internal')
    );
  } catch (err) {
    console.error('[resume-rockstar/save]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
