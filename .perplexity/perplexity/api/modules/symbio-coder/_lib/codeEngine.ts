// © 2026 Keith Soyka — GestaltView
// Symbio Coder — Code Engine utilities

export interface CodeAnalysis {
  language: string;
  complexity: number;
  lineCount: number;
  patterns: string[];
  issues: { type: string; message: string; line: number }[];
}

export function analyzeCode(code: string, language: string): CodeAnalysis {
  const lines = code.split('\n');
  const conditions = (code.match(/\b(if|else|for|while|switch|catch)\b/g) ?? []).length;
  const functions = (code.match(/\b(function|=>|def)\b/g) ?? []).length;
  const complexity = Math.min(10, Math.ceil((conditions + functions) / 3));

  const patterns: string[] = [];
  if (/async|await/.test(code)) patterns.push('async-await');
  if (/\bclass\b/.test(code)) patterns.push('object-oriented');
  if (/=>/.test(code)) patterns.push('functional');
  if (/\bimport\b/.test(code)) patterns.push('es-modules');

  const issues: CodeAnalysis['issues'] = [];
  lines.forEach((line, i) => {
    if (line.includes('console.log')) {
      issues.push({ type: 'debug-code', message: 'Remove console.log before deployment', line: i + 1 });
    }
    if (line.includes('TODO') || line.includes('FIXME')) {
      issues.push({ type: 'todo', message: line.trim(), line: i + 1 });
    }
  });

  return { language, complexity, lineCount: lines.length, patterns, issues };
}
