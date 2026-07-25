import React from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BillyMarkdownProps {
  content: string;
  className?: string;
}

function renderInline(text: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  const pattern = /(\*\*[^*]+?\*\*|`[^`]+?`|\[[^\]]+?\]\([^)]+?\)|\*[^*]+?\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${match.index}-${token}`;

    if (token.startsWith("**") && token.endsWith("**")) {
      tokens.push(
        <strong key={key} className="font-semibold text-cyan-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      tokens.push(
        <code
          key={key}
          className="rounded border border-cyan-500/20 bg-black/40 px-1 py-0.5 font-mono text-[0.92em] text-cyan-100"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const splitIndex = token.indexOf("](");
      const label = token.slice(1, splitIndex);
      const href = token.slice(splitIndex + 2, -1);
      tokens.push(
        <a
          key={key}
          className="text-cyan-200 underline decoration-cyan-400/40 underline-offset-4 hover:text-white"
          href={href}
          rel="noreferrer"
          target="_blank"
        >
          {label}
        </a>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      tokens.push(
        <em key={key} className="text-cyan-100/90">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens;
}

function isTableBlock(lines: string[]): boolean {
  if (lines.length < 2) {
    return false;
  }

  const [header, divider] = lines;
  return header.includes("|") && /^\s*\|?(\s*:?-{3,}:?\s*\|)+\s*$/.test(divider);
}

function renderTable(lines: string[], index: number): ReactNode {
  const rows = lines.map((line) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim()),
  );
  const headers = rows[0] ?? [];
  const body = rows.slice(2);

  return (
    <div key={index} className="my-3 overflow-x-auto rounded-[1.1rem] border border-white/10 bg-black/35">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-white/[0.04] text-white/82">
          <tr>
            {headers.map((cell, cellIndex) => (
              <th key={cellIndex} className="border-b border-white/10 px-3 py-2 font-medium">
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={rowIndex} className="odd:bg-white/[0.015]">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border-b border-white/8 px-3 py-2 align-top text-white/72">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderTextBlock(block: string, index: number): ReactNode {
  const lines = block.split("\n").filter((line) => line.trim().length > 0);
  const firstLine = lines[0]?.trim() ?? "";

  if (/^#{1,3}\s+/.test(firstLine)) {
    const level = firstLine.match(/^#+/)?.[0].length ?? 2;
    const text = firstLine.replace(/^#{1,3}\s+/, "");
    const Heading = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
    return (
      <Heading key={index} className="mb-2 text-sm font-semibold text-cyan-100">
        {renderInline(text)}
      </Heading>
    );
  }

  if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
    return (
      <ul key={index} className="my-2 list-disc space-y-1 pl-5">
        {lines.map((line, lineIndex) => (
          <li key={lineIndex} className="pl-1">
            {renderInline(line.replace(/^\s*[-*]\s+/, ""))}
          </li>
        ))}
      </ul>
    );
  }

  if (lines.every((line) => /^\s*\d+\.\s+/.test(line))) {
    return (
      <ol key={index} className="my-2 list-decimal space-y-1 pl-5">
        {lines.map((line, lineIndex) => (
          <li key={lineIndex} className="pl-1">
            {renderInline(line.replace(/^\s*\d+\.\s+/, ""))}
          </li>
        ))}
      </ol>
    );
  }

  if (lines.every((line) => /^\s*>\s?/.test(line))) {
    return (
      <blockquote key={index} className="my-3 border-l-2 border-cyan-300/25 bg-cyan-300/[0.04] px-4 py-3 text-white/74">
        {renderInline(lines.map((line) => line.replace(/^\s*>\s?/, "")).join(" "))}
      </blockquote>
    );
  }

  if (isTableBlock(lines)) {
    return renderTable(lines, index);
  }

  return (
    <p key={index} className="mb-2 last:mb-0">
      {renderInline(lines.join("\n"))}
    </p>
  );
}

export default function BillyMarkdown({ content, className }: BillyMarkdownProps) {
  const parts = content.split(/(```[\s\S]*?```)/g).filter(Boolean);

  return (
    <div className={cn("gv-billy-markdown", className)}>
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const code = part.slice(3, -3).replace(/^\w+\n/, "");
          return (
            <pre
              key={index}
              className="my-3 overflow-x-auto rounded-xl border border-cyan-500/15 bg-black/50 p-3 font-mono text-xs leading-6 text-cyan-50/80"
            >
              {code}
            </pre>
          );
        }

        const blocks = part.split(/\n{2,}/).filter((block) => block.trim().length > 0);
        return blocks.map((block, blockIndex) => renderTextBlock(block, index * 100 + blockIndex));
      })}
    </div>
  );
}
