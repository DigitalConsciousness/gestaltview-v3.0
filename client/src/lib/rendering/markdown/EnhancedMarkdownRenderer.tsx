import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { getMarkdownCalloutKind, prepareMarkdownForRender } from "./analyzeMarkdown";
import { MarkdownCodeBlock } from "./MarkdownCodeBlock";

type EnhancedMarkdownRendererProps = {
  content: string;
  mode?: "inline" | "compact" | "fullscreen" | "export-preview";
  maxHeight?: number;
  className?: string;
};

function anchorId(children: unknown): string {
  return String(children)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const components: Components = {
  h1: ({ children }) => <h1 id={anchorId(children)} className="mt-0 text-3xl font-semibold leading-tight text-white">{children}</h1>,
  h2: ({ children }) => <h2 id={anchorId(children)} className="mt-8 border-b border-white/10 pb-2 text-2xl font-semibold leading-tight text-cyan-50">{children}</h2>,
  h3: ({ children }) => <h3 id={anchorId(children)} className="mt-7 text-xl font-semibold text-cyan-50/95">{children}</h3>,
  h4: ({ children }) => <h4 id={anchorId(children)} className="mt-6 text-base font-semibold uppercase tracking-[0.08em] text-cyan-100/76">{children}</h4>,
  p: ({ children }) => <p className="my-4 leading-7 text-slate-100/82">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="text-cyan-50/90">{children}</em>,
  a: ({ href, children }) => (
    <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="text-cyan-200 underline decoration-cyan-200/35 underline-offset-4 hover:text-cyan-50">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="my-4 ml-5 list-disc space-y-2 text-slate-100/82">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 ml-5 list-decimal space-y-2 text-slate-100/82">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
  table: ({ children }) => <div className="my-5 overflow-x-auto rounded-xl border border-white/10"><table className="min-w-full border-collapse text-sm">{children}</table></div>,
  thead: ({ children }) => <thead className="bg-cyan-100/10 text-cyan-50">{children}</thead>,
  th: ({ children }) => <th className="border-b border-white/10 px-3 py-2 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-b border-white/8 px-3 py-2 text-slate-100/78">{children}</td>,
  blockquote: ({ children }) => {
    const text = String(children);
    const kind = getMarkdownCalloutKind(`> ${text}`);
    const tone = kind === "warning"
      ? "border-amber-300/40 bg-amber-300/10 text-amber-50"
      : kind === "success"
        ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-50"
        : "border-cyan-200/35 bg-cyan-200/10 text-cyan-50";

    return <blockquote className={cn("my-5 rounded-xl border-l-4 px-4 py-3", tone)}>{children}</blockquote>;
  },
  code: ({ className, children }) => {
    const value = String(children ?? "");
    const isInline = !className && !value.includes("\n");

    if (isInline) {
      return <code className="rounded-md border border-white/10 bg-white/8 px-1.5 py-0.5 text-[0.9em] text-cyan-50">{children}</code>;
    }

    return <MarkdownCodeBlock className={className}>{children}</MarkdownCodeBlock>;
  },
  hr: () => <hr className="my-8 border-white/10" />,
};

export function EnhancedMarkdownRenderer({ content, mode = "inline", maxHeight, className }: EnhancedMarkdownRendererProps) {
  const compact = mode === "compact";
  const preparedContent = prepareMarkdownForRender(content);

  return (
    <article
      className={cn(
        "gv-markdown-pro-renderer rounded-xl border border-white/10 bg-slate-950/42 text-slate-100 shadow-[0_20px_80px_rgba(2,6,23,0.22)]",
        compact ? "px-4 py-3 text-sm" : "px-5 py-5 text-[0.95rem]",
        className,
      )}
      style={{
        maxHeight,
        overflowY: maxHeight ? "auto" : undefined,
        fontFamily: "var(--gv-plk-font, inherit)",
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {preparedContent}
      </ReactMarkdown>
    </article>
  );
}
