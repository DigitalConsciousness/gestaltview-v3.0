import React from "react";
import { MermaidDiagram } from "../diagram/MermaidDiagram";
import { getMarkdownCodeKind } from "./analyzeMarkdown";

type MarkdownCodeBlockProps = {
  className?: string;
  children: unknown;
};

function codeToString(children: unknown): string {
  return String(children ?? "").replace(/\n$/, "");
}

function languageFromClassName(className = ""): string {
  return className.replace(/^language-/, "").trim();
}

export function MarkdownCodeBlock({ className, children }: MarkdownCodeBlockProps) {
  const language = languageFromClassName(className);
  const code = codeToString(children);

  if (getMarkdownCodeKind(language, code) === "diagram") {
    return <MermaidDiagram code={code} language={language || "mermaid"} />;
  }

  return (
    <pre className="my-5 overflow-auto rounded-xl border border-white/10 bg-black/38 p-4 text-sm leading-6 text-cyan-50/84">
      <code className={className}>{code}</code>
    </pre>
  );
}
