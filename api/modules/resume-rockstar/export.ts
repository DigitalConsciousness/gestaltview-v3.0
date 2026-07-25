// © 2026 Keith Soyka — GestaltView
// Resume Rockstar API — Export endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createResponse } from '../../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resumeId, format, resume } = req.body;

    if (!format || !['markdown', 'json', 'pdf'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use markdown | json | pdf' });
    }

    let content: string | undefined;

    if (format === 'json') {
      content = JSON.stringify(resume, null, 2);
    } else if (format === 'markdown') {
      content = buildMarkdown(resume);
    } else if (format === 'pdf') {
      // TODO: Integrate PDF generation (pdfkit or external service)
      return res.status(501).json({ error: 'PDF export not yet implemented' });
    }

    return res.status(200).json(
      createResponse({
        resumeId,
        format,
        content,
        generatedAt: new Date().toISOString(),
      }, 'internal')
    );
  } catch (err) {
    console.error('[resume-rockstar/export]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function buildMarkdown(resume: any): string {
  if (!resume) return '';
  let md = `# ${resume.title ?? 'Resume'}\n\n`;
  for (const section of (resume.sections ?? [])) {
    md += `## ${section.type}\n\n${section.content}\n\n`;
  }
  return md;
}
