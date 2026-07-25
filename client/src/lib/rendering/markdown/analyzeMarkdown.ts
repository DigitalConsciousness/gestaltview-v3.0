export type MarkdownCodeKind = "diagram" | "code";
export type MarkdownCalloutKind = "note" | "warning" | "success" | "info";

export type MarkdownCodeBlock = {
  language: string;
  code: string;
  kind: MarkdownCodeKind;
};

export type MarkdownDiagramBlock = {
  language: string;
  code: string;
};

export type MarkdownAnalysis = {
  codeBlocks: MarkdownCodeBlock[];
  diagramBlocks: MarkdownDiagramBlock[];
  headingCount: number;
  calloutCount: number;
};

const DIAGRAM_LANGUAGE_HINTS = new Set([
  "mermaid",
  "mindmap",
  "flowchart",
  "graph",
  "sequencediagram",
  "classdiagram",
  "statediagram",
  "journey",
  "gantt",
  "pie",
  "erdiagram",
]);

const MERMAID_DIRECTIVE_PATTERN = /^(graph\s+(?:td|tb|bt|rl|lr)|flowchart\s+(?:td|tb|bt|rl|lr)|sequencediagram|classdiagram|statediagram|journey|gantt|pie|erdiagram|mindmap)\b/i;

function normalizeLanguage(language = ""): string {
  return language.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getMarkdownCodeKind(language = "", code = ""): MarkdownCodeKind {
  const normalizedLanguage = normalizeLanguage(language);

  if (DIAGRAM_LANGUAGE_HINTS.has(normalizedLanguage)) {
    return "diagram";
  }

  if (!normalizedLanguage && MERMAID_DIRECTIVE_PATTERN.test(code.trim())) {
    return "diagram";
  }

  return "code";
}

export function normalizeMermaidSource(language: string, code: string): string {
  const trimmed = code.trim();
  const normalizedLanguage = normalizeLanguage(language);

  if (normalizedLanguage === "flowchart" && !/^flowchart\b/i.test(trimmed)) {
    return `flowchart TD\n${trimmed}`;
  }

  if (normalizedLanguage === "graph" && !/^graph\b/i.test(trimmed)) {
    return `graph TD\n${trimmed}`;
  }

  if (normalizedLanguage === "mindmap" && !/^mindmap\b/i.test(trimmed)) {
    return `mindmap\n${trimmed}`;
  }

  return trimmed;
}

export function getMarkdownCalloutKind(value: string): MarkdownCalloutKind | null {
  const match = value.trim().match(/^>\s*\[!(NOTE|WARNING|WARN|SUCCESS|TIP|INFO)\]/i);

  if (!match) {
    return null;
  }

  switch (match[1].toUpperCase()) {
    case "WARNING":
    case "WARN":
      return "warning";
    case "SUCCESS":
      return "success";
    case "TIP":
    case "INFO":
      return "info";
    default:
      return "note";
  }
}

export function analyzeMarkdown(source: string): MarkdownAnalysis {
  const codeBlocks: MarkdownCodeBlock[] = [];
  const diagramBlocks: MarkdownDiagramBlock[] = [];
  const fencePattern = /```([^\n`]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = fencePattern.exec(source)) !== null) {
    const language = match[1].trim();
    const rawCode = match[2].replace(/\n$/, "");
    const kind = getMarkdownCodeKind(language, rawCode);
    const code = kind === "diagram" ? normalizeMermaidSource(language, rawCode) : rawCode;

    codeBlocks.push({ language, code, kind });

    if (kind === "diagram") {
      diagramBlocks.push({ language: language || "mermaid", code });
    }
  }

  return {
    codeBlocks,
    diagramBlocks,
    headingCount: source.split(/\r?\n/).filter((line) => /^#{1,6}\s+\S/.test(line)).length,
    calloutCount: source.split(/\r?\n/).filter((line) => getMarkdownCalloutKind(line)).length,
  };
}

export function prepareMarkdownForRender(source: string): string {
  return source.replace(/^>\s*\[!(NOTE|WARNING|WARN|SUCCESS|TIP|INFO)\]\s*/gim, (_match, rawKind: string) => {
    const kind = rawKind.toUpperCase();
    const label = kind === "WARN" || kind === "WARNING"
      ? "Warning"
      : kind === "SUCCESS"
        ? "Success"
        : kind === "TIP"
          ? "Tip"
          : kind === "INFO"
            ? "Info"
            : "Note";

    return `> **${label}:** `;
  });
}
