import { useMemo, useState } from "react";
import { ArrowRight, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { CaptureBlueprint, CaptureBlueprintOutput } from "./Scaffold";
import { routeBlueprintToRoom } from "@/lib/creationCorner";

type ArtifactPreviewerProps = {
  blueprint: CaptureBlueprint | null;
  blueprints: CaptureBlueprint[];
  onSelectBlueprint: (blueprint: CaptureBlueprint) => void;
};

type PreviewFormat = "storybook" | "report" | "resume" | "website" | "infographic" | "slide deck" | "PDF" | "markdown";

const FORMAT_OPTIONS: PreviewFormat[] = ["storybook", "report", "resume", "website", "infographic", "slide deck", "PDF", "markdown"];

function formatPreviewKey(format: PreviewFormat): keyof CaptureBlueprintOutput {
  switch (format) {
    case "website":
      return "html";
    case "PDF":
      return "pdfHtml";
    case "storybook":
    case "report":
    case "resume":
    case "slide deck":
    case "markdown":
      return "markdown";
    case "infographic":
      return "imagePrompt";
    default:
      return "markdown";
  }
}

function outputForFormat(blueprint: CaptureBlueprint, format: PreviewFormat): string {
  const key = formatPreviewKey(format);
  const value = blueprint.outputs[key];
  return value || blueprint.outputs.markdown || "No preview yet.";
}

function downloadTextFile(fileName: string, content: string, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ArtifactPreviewer({ blueprint, blueprints, onSelectBlueprint }: ArtifactPreviewerProps) {
  const [format, setFormat] = useState<PreviewFormat>("markdown");
  const [notes, setNotes] = useState("");
  const [conversation, setConversation] = useState<string[]>([
    "Oh GOD, what do we make with THIS? We could do a storybook, a report, a resume, a website, or all of them.",
  ]);

  const preview = useMemo(() => {
    if (!blueprint) {
      return "Select a blueprint to begin.";
    }

    return outputForFormat(blueprint, format);
  }, [blueprint, format]);

  const appendConversation = (entry: string) => {
    setConversation((current) => [entry, ...current].slice(0, 5));
  };

  const handleRefine = () => {
    if (!notes.trim()) {
      return;
    }

    appendConversation(`User: ${notes.trim()}`);
    appendConversation("Art Teacher: Perfect. That changes the posture without killing the idea.");
    setNotes("");
  };

  const handleSend = () => {
    if (!blueprint) {
      return;
    }

    routeBlueprintToRoom(blueprint, "dynamic-inner-world");
    toast.success("Sent to Dynamic Inner World");
  };

  const handleDownload = () => {
    if (!blueprint) {
      return;
    }

    downloadTextFile(`${blueprint.title}.md`, preview);
    toast.message("Blueprint downloaded.");
  };

  if (!blueprint) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-6">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-sm leading-6 text-gv-text-secondary">
          Select a blueprint to open the previewer.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.5rem] border border-white/10 bg-gv-bg-deep/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gv-text-primary">{blueprint.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gv-text-muted">Artifact preview</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {FORMAT_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormat(option)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    option === format
                      ? "border-gv-aurora-cyan/30 bg-gv-aurora-cyan/10 text-gv-text-primary"
                      : "border-white/10 bg-white/[0.03] text-gv-text-muted hover:text-gv-text-primary"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 min-h-[260px] rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
            <pre className="whitespace-pre-wrap text-sm leading-7 text-gv-text-secondary">{preview}</pre>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSend}
              className="inline-flex items-center gap-2 rounded-full border border-gv-aurora-cyan/25 bg-gv-aurora-cyan/10 px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:bg-gv-aurora-cyan/14"
            >
              <ArrowRight className="h-4 w-4" />
              Send to Dynamic Inner World
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:border-white/20 hover:bg-white/[0.08]"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gv-aurora-amber/20 bg-gv-aurora-amber/10 text-gv-aurora-amber">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-gv-text-primary">Art Teacher</p>
              <p className="mt-1 text-xs text-gv-text-muted">Refinement conversation</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {conversation.map((line) => (
              <div key={line} className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm leading-6 text-gv-text-secondary">
                {line}
              </div>
            ))}
          </div>

          <label className="mt-4 block text-xs uppercase tracking-[0.22em] text-gv-text-muted">
            Refinement note
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What should shift?"
              className="mt-2 min-h-[120px] w-full rounded-[1rem] border border-white/10 bg-black/30 p-3 text-sm leading-6 text-gv-text-primary outline-none transition-colors placeholder:text-gv-text-muted focus:border-gv-aurora-cyan/30"
            />
          </label>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleRefine}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:border-white/20 hover:bg-white/[0.08]"
            >
              Refine
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-gv-text-muted">Already made</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {blueprints.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectBlueprint(item)}
              className={`rounded-[1.15rem] border p-3 text-left transition-colors ${
                item.id === blueprint.id
                  ? "border-gv-aurora-cyan/30 bg-gv-aurora-cyan/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <p className="text-sm font-semibold text-gv-text-primary">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-gv-text-muted">{item.summary}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
