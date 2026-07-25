// © 2026 Keith Soyka — GestaltView
// Resume Rockstar — Engine utilities

export function validateResumeSection(type: string, content: string): string[] {
  const errors: string[] = [];
  if (!content || content.trim().length === 0) {
    errors.push(`${type} section cannot be empty`);
  }
  if (type === 'objective' && content.length < 50) {
    errors.push('Objective must be at least 50 characters');
  }
  if (type === 'experience' && content.length < 100) {
    errors.push('Experience description must be at least 100 characters');
  }
  return errors;
}

export function buildMarkdownResume(resume: any): string {
  let md = `# ${resume.title ?? 'Resume'}\n\n`;
  for (const section of (resume.sections ?? [])) {
    md += `## ${String(section.type).charAt(0).toUpperCase() + String(section.type).slice(1)}\n\n${section.content}\n\n`;
  }
  return md;
}

export function buildResumeContext(resume: any): string {
  return resume.sections
    .map((s: any) => `[${s.type}]: ${s.content}`)
    .join('\n');
}
