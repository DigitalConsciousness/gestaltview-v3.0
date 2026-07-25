import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { ArrowRight, Copy, Download, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  buildCreationCornerOutputs,
  scoreResonanceLocalFallback as scoreResonance,
} from "@/lib/genEngineClient";
import { routeBlueprintToRoom, type CreationCornerTargetRoom } from "@/lib/creationCorner";
import {
  appendBlueprint,
  updateBlueprint,
  type CaptureBlueprint,
  type CaptureBlueprintOutput,
} from "@/components/Scaffold";
import { uploadUserFileToServer } from "@/lib/fileStorage";
import { appendUserFile, createUserFileRecord, type UserFileRecord } from "@/lib/innerWorldFiles";
import { callBillyApi } from "@/lib/billyApi";

type BlueprintGenerativeWorkbenchProps = {
  blueprint: CaptureBlueprint | null;
  blueprints: CaptureBlueprint[];
  onSelectBlueprint: (blueprint: CaptureBlueprint) => void;
  currentUserId?: string | null;
};

type PreviewKey = keyof CaptureBlueprintOutput | "json";

type DraftState = {
  title: string;
  summary: string;
  tagsText: string;
  status: CaptureBlueprint["status"];
  note: string;
};

type OutputDefinition = {
  key: PreviewKey;
  label: string;
  description: string;
  fileExtension: string;
  mimeType: string;
};

type InspirationItem = {
  id: string;
  kind: "url" | "clipboard" | "file";
  label: string;
  detail: string;
  createdAt: string;
};

const OUTPUT_DEFINITIONS: OutputDefinition[] = [
  { key: "markdown", label: "Markdown", description: "Working blueprint text.", fileExtension: "md", mimeType: "text/markdown;charset=utf-8" },
  { key: "html", label: "HTML", description: "Browser-ready composition.", fileExtension: "html", mimeType: "text/html;charset=utf-8" },
  { key: "pdfHtml", label: "PDF HTML", description: "Print-friendly PDF source.", fileExtension: "html", mimeType: "text/html;charset=utf-8" },
  { key: "code", label: "Code", description: "Structured export payload.", fileExtension: "ts", mimeType: "text/plain;charset=utf-8" },
  { key: "agentPrompt", label: "Agent Prompt", description: "Instructions for another model.", fileExtension: "txt", mimeType: "text/plain;charset=utf-8" },
  { key: "imagePrompt", label: "Image Prompt", description: "Visual direction for a companion image.", fileExtension: "txt", mimeType: "text/plain;charset=utf-8" },
  { key: "marketingCopy", label: "Marketing Copy", description: "Short shareable positioning.", fileExtension: "txt", mimeType: "text/plain;charset=utf-8" },
  { key: "shareCard", label: "Share Card", description: "Compact share-ready block.", fileExtension: "txt", mimeType: "text/plain;charset=utf-8" },
  { key: "json", label: "Blueprint JSON", description: "Serializable blueprint payload.", fileExtension: "json", mimeType: "application/json;charset=utf-8" },
];

function slugifyIdentifier(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "blueprint";
}

function createId(prefix = "blueprint"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function splitTags(value: string, fallback: string[] = []): string[] {
  const merged = [...value.split(/[,;\n|]/g), ...fallback]
    .map((tag) => tag.trim())
    .filter(Boolean);

  return Array.from(new Set(merged));
}

function outputTextForPreview(blueprint: CaptureBlueprint, outputKey: PreviewKey): string {
  if (outputKey === "json") {
    return JSON.stringify(blueprint, null, 2);
  }

  return blueprint.outputs[outputKey] || blueprint.outputs.markdown || "No preview yet.";
}

function outputDefinitionForKey(key: PreviewKey): OutputDefinition {
  return OUTPUT_DEFINITIONS.find((definition) => definition.key === key) ?? OUTPUT_DEFINITIONS[0];
}

function downloadTextFile(fileName: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function firstLineTitle(value: string): string {
  const firstLine = value
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .find(Boolean);

  return (firstLine?.slice(0, 72) || "Untitled Blueprint").trim();
}

function appendFreeformText(current: string, addition: string): string {
  const trimmedAddition = addition.trim();
  if (!trimmedAddition) {
    return current;
  }

  const trimmedCurrent = current.trim();
  if (!trimmedCurrent) {
    return trimmedAddition;
  }

  return `${trimmedCurrent}\n\n${trimmedAddition}`;
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export function createFreshBlueprintFromText(text: string): CaptureBlueprint | null {
  const summary = text.trim();
  if (!summary) {
    return null;
  }

  const title = firstLineTitle(summary);
  const now = new Date().toISOString();
  const outputs = buildCreationCornerOutputs({
    title,
    summary,
    tags: [],
    status: "draft",
    note: "",
    sourceMarkdown: summary,
    sourceBlueprintJson: "{}",
    sourceCaptureIds: [],
    captureCount: 1,
    sourceRoom: "creation-corner",
  });

  return {
    id: createId("blueprint"),
    title,
    summary,
    sourceOrbIds: [],
    captureCount: 1,
    tags: [],
    status: "draft",
    createdAt: now,
    updatedAt: now,
    outputs,
  };
}

export default function BlueprintGenerativeWorkbench({
  blueprint,
  blueprints,
  onSelectBlueprint,
  currentUserId,
}: BlueprintGenerativeWorkbenchProps) {
  const [selectedOutput, setSelectedOutput] = useState<PreviewKey>("markdown");
  const [draft, setDraft] = useState<DraftState>({
    title: "",
    summary: "",
    tagsText: "",
    status: "draft",
    note: "",
  });
  const [freeformDraft, setFreeformDraft] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [inspirationUrl, setInspirationUrl] = useState("");
  const [inspirationItems, setInspirationItems] = useState<InspirationItem[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<string[]>([
    "Art Teacher: Bring me the shape, and I'll keep the edge while we improve it.",
  ]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const voiceRecognitionRef = useRef<any>(null);
  const voiceBaseDraftRef = useRef("");
  const voiceTranscriptRef = useRef("");

  useEffect(() => {
    if (!blueprint) {
      setDraft({
        title: "",
        summary: "",
        tagsText: "",
        status: "draft",
        note: "",
      });
      setFreeformDraft("");
      setChatInput("");
      setInspirationUrl("");
      setInspirationItems([]);
      setSelectedOutput("markdown");
      setConversation([
        "Art Teacher: No blueprint yet? That's fine. Start anywhere - a thought, a title, three words, a photo. I'll help you shape it.",
      ]);
      setIsListening(false);
      return;
    }

    setDraft({
      title: blueprint.title,
      summary: blueprint.summary,
      tagsText: blueprint.tags.join(", "),
      status: blueprint.status,
      note: "",
    });
    setChatInput("");
    setInspirationUrl("");
    setInspirationItems([]);
    setSelectedOutput("markdown");
    setConversation([
      `Art Teacher: ${blueprint.title} is ready for another pass. Pull the levers you want.`,
    ]);
  }, [blueprint]);

  const sourceBlueprintJson = useMemo(
    () => (blueprint ? JSON.stringify(blueprint, null, 2) : ""),
    [blueprint],
  );

  const draftResonance = useMemo(() => {
    if (!blueprint) {
      return null;
    }

    return scoreResonance({
      text: [
        draft.title,
        draft.summary,
        draft.note,
        draft.tagsText,
        blueprint.outputs.markdown,
      ]
        .filter(Boolean)
        .join("\n"),
      plkContext: {
        source_title: blueprint.title,
        source_summary: blueprint.summary,
        source_tags: blueprint.tags.join(", "),
        source_status: blueprint.status,
      },
    });
  }, [blueprint, draft.note, draft.summary, draft.tagsText, draft.title]);

  const workingBlueprint = useMemo(() => {
    if (!blueprint) {
      return null;
    }

    const title = draft.title.trim() || blueprint.title;
    const summary = draft.summary.trim() || blueprint.summary;
    const tags = splitTags(draft.tagsText, blueprint.tags);
    const outputs = buildCreationCornerOutputs({
      title,
      summary,
      tags,
      status: draft.status,
      note: draft.note.trim(),
      sourceMarkdown: blueprint.outputs.markdown,
      sourceBlueprintJson,
      sourceCaptureIds: blueprint.sourceOrbIds,
      captureCount: blueprint.captureCount,
      sourceRoom: "creation-corner",
    });

    return {
      ...blueprint,
      title,
      summary,
      tags,
      status: draft.status,
      outputs,
    } satisfies CaptureBlueprint;
  }, [blueprint, draft, sourceBlueprintJson]);

  const previewOutput = useMemo(() => {
    if (!workingBlueprint) {
      return "";
    }

    return outputTextForPreview(workingBlueprint, selectedOutput);
  }, [selectedOutput, workingBlueprint]);

  const codexManifestPreview = useMemo(() => {
    if (!workingBlueprint) {
      return [];
    }

    return [
      { format: "html", status: "ready" },
      { format: "pdf", status: "pending" },
      { format: "json", status: "ready" },
    ];
  }, [workingBlueprint]);

  const appendInspirationText = (snippet: string) => {
    const trimmedSnippet = snippet.trim();
    if (!trimmedSnippet) {
      return;
    }

    if (blueprint) {
      setDraft((current) => ({ ...current, note: appendFreeformText(current.note, trimmedSnippet) }));
      return;
    }

    setFreeformDraft((current) => appendFreeformText(current, trimmedSnippet));
  };

  const recordInspirationItem = (kind: InspirationItem["kind"], label: string, detail: string) => {
    const trimmedDetail = detail.trim();
    if (!trimmedDetail) {
      return;
    }

    const createdAt = new Date().toISOString();
    setInspirationItems((current) =>
      [
        {
          id: createId("inspiration"),
          kind,
          label,
          detail: trimmedDetail,
          createdAt,
        },
        ...current,
      ].slice(0, 8),
    );
    appendInspirationText(trimmedDetail);
  };

  const handleAddInspirationFromUrl = () => {
    const rawUrl = inspirationUrl.trim();
    if (!rawUrl) {
      return;
    }

    let label = rawUrl;
    try {
      label = new URL(rawUrl).hostname.replace(/^www\./, "") || rawUrl;
    } catch {
      // Keep the raw URL if it cannot be parsed.
    }

    recordInspirationItem("url", label, `Inspiration URL: ${rawUrl}`);
    setInspirationUrl("");
    toast.success("Inspiration added.");
  };

  const processInspirationFile = async (file: File) => {
    if (!currentUserId) {
      toast.error("Sign in to upload files.");
      return;
    }

    const textPreview = file.type.startsWith("text/") ? await file.text() : undefined;
    const dataUrl = await fileToDataUrl(file);

    const fileRecord: UserFileRecord = createUserFileRecord({
      userId: currentUserId,
      file,
      roomOrigin: "creation_corner",
      previewText: textPreview,
      dataUrl,
      previewUrl: dataUrl,
    });

    const persisted =
      (await uploadUserFileToServer({
        file: fileRecord,
        content: fileRecord.previewText ?? file.name,
        base64DataUrl: fileRecord.previewUrl ?? fileRecord.dataUrl ?? undefined,
      })) ?? fileRecord;

    appendUserFile(persisted);
    recordInspirationItem(
      "file",
      file.name,
      textPreview?.trim() || `[Attached file: ${file.name}]`,
    );
    toast.success("File added to the draft.");
  };

  const handleRefine = async () => {
    const note = (draft.note || chatInput).trim();
    if (!note) {
      return;
    }

    setConversation((current) => [`User: ${note}`, ...current].slice(0, 8));
    setChatInput("");
    setDraft((current) => ({ ...current, note: "" }));

    try {
      const response = await callBillyApi(
        note,
        "creation-corner",
        "chat",
        undefined,
        "art-teacher",
        "creation-corner",
      );
      const reply = (response as any)?.text?.trim() ?? "Good. Check the updated draft.";
      setConversation((current) => [`Art Teacher: ${reply}`, ...current].slice(0, 8));
    } catch {
      setConversation((current) => [
        `Art Teacher: Shifting toward "${note.split(" ").slice(0, 4).join(" ")}..." - check the draft.`,
        ...current,
      ].slice(0, 8));
    }
  };

  const handleCreateFreeformBlueprint = () => {
    const freshBlueprint = createFreshBlueprintFromText(freeformDraft);
    if (!freshBlueprint) {
      toast.info("Give me a few words first.");
      return;
    }

    appendBlueprint(freshBlueprint);
    onSelectBlueprint(freshBlueprint);
    setFreeformDraft("");
    toast.success("Fresh blueprint created.");
  };

  const handleFreeformUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFreeformFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!currentUserId) {
      toast.error("Sign in to upload files.");
      return;
    }

    await processInspirationFile(file);
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard?.read) {
        try {
          const clipboardItems = await navigator.clipboard.read();
          const imageItem = clipboardItems.find((item) =>
            item.types.some((type) => type.startsWith("image/")),
          );

          if (imageItem) {
            const imageType =
              imageItem.types.find((type) => type.startsWith("image/")) ?? "image/png";
            const blob = await imageItem.getType(imageType);
            const extension = imageType.split("/")[1]?.replace(/[^a-z0-9]+/gi, "") || "png";
            const clipboardFile = new File([blob], `clipboard-${Date.now()}.${extension}`, {
              type: blob.type || imageType,
            });
            await processInspirationFile(clipboardFile);
            return;
          }
        } catch {
          // Fall back to text if clipboard image access is blocked.
        }
      }

      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.info("Clipboard is empty.");
        return;
      }

      recordInspirationItem(
        "clipboard",
        text.split(/\s+/g).slice(0, 8).join(" ") || "Clipboard text",
        text,
      );
      toast.success("Pasted from clipboard.");
    } catch {
      toast.error("I couldn't read the clipboard right now.");
    }
  };

  const startVoiceNoteCapture = () => {
    if (isListening) {
      voiceRecognitionRef.current?.stop?.();
      return;
    }

    const SpeechRecognition =
      (typeof window !== "undefined" && ((window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ?? (window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition)) ??
      null;

    if (!SpeechRecognition) {
      toast.error("Voice capture is unavailable in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      voiceBaseDraftRef.current = freeformDraft;
      voiceTranscriptRef.current = "";
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }

      const nextTranscript = transcript.trim();
      if (!nextTranscript) {
        return;
      }

      const nextDraft = appendFreeformText(voiceBaseDraftRef.current, nextTranscript);
      voiceTranscriptRef.current = nextDraft;
      setFreeformDraft(nextDraft);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      voiceRecognitionRef.current = null;
      toast.error(event?.error ? `Voice note stopped: ${event.error}` : "Voice note stopped.");
    };

    recognition.onend = () => {
      setIsListening(false);
      voiceRecognitionRef.current = null;
      if (voiceTranscriptRef.current.trim()) {
        toast.success("Voice note captured.");
      }
    };

    voiceRecognitionRef.current = recognition;
    recognition.start();
  };

  const handleSaveDraft = () => {
    if (!workingBlueprint) {
      return;
    }

    updateBlueprint(workingBlueprint.id, () => workingBlueprint);
    setConversation((current) => [
      `Art Teacher: Saved "${workingBlueprint.title}" and kept the generated outputs in sync.`,
      ...current,
    ].slice(0, 6));
    toast.success("Blueprint materialized and synced.");
  };

  const handleRouteBlueprint = (targetRoom: CreationCornerTargetRoom) => {
    if (!workingBlueprint) {
      return;
    }

    updateBlueprint(workingBlueprint.id, () => workingBlueprint);
    const capture = routeBlueprintToRoom(workingBlueprint, targetRoom);

    if (!capture) {
      toast.error("I couldn't route that blueprint.");
      return;
    }

    const roomLabel =
      targetRoom === "blackboard"
        ? "Blackboard"
        : targetRoom === "dynamic-inner-world"
          ? "Dynamic Inner World"
          : "External Scaffold";

    toast.success(`Sent to ${roomLabel}.`);
  };

  const handleCopy = async () => {
    if (!workingBlueprint) {
      return;
    }

    try {
      await navigator.clipboard.writeText(previewOutput);
      toast.success(`${outputDefinitionForKey(selectedOutput).label} copied.`);
    } catch {
      toast.error("The clipboard isn't reachable right now.");
    }
  };

  const handleDownload = () => {
    if (!workingBlueprint) {
      return;
    }

    const definition = outputDefinitionForKey(selectedOutput);
    downloadTextFile(
      `${slugifyIdentifier(workingBlueprint.title)}-${definition.key}.${definition.fileExtension}`,
      previewOutput,
      definition.mimeType,
    );
    toast.message(`${definition.label} downloaded.`);
  };

  const activeDefinition = outputDefinitionForKey(selectedOutput);

  const inspirationImportPanel = (
    <div className="mt-4 rounded-[1.2rem] border border-white/8 bg-black/20 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gv-aurora-amber">Inspiration</p>
      <p className="mt-1 text-xs text-gv-text-muted">
        Drop a URL, paste clipboard content, or upload a file to fold it into the draft.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="url"
          placeholder="https://..."
          value={inspirationUrl}
          onChange={(event) => setInspirationUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAddInspirationFromUrl();
            }
          }}
          className="flex-1 rounded-[0.75rem] border border-white/10 bg-black/25 px-3 py-2 text-sm text-gv-text-primary outline-none placeholder:text-gv-text-muted focus:border-gv-aurora-cyan/30"
        />
        <button
          type="button"
          onClick={handleAddInspirationFromUrl}
          disabled={!inspirationUrl.trim()}
          className="inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-gv-text-primary transition-colors hover:bg-white/[0.08] disabled:opacity-30"
        >
          Add
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handlePasteFromClipboard()}
          className="inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-gv-text-primary transition-colors hover:bg-white/[0.08]"
        >
          Paste from clipboard
        </button>
        <button
          type="button"
          onClick={handleFreeformUploadClick}
          className="inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-gv-text-primary transition-colors hover:bg-white/[0.08]"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload file
        </button>
      </div>
      {inspirationItems.length > 0 ? (
        <ul className="mt-3 max-h-28 space-y-1 overflow-y-auto">
          {inspirationItems.map((item, index) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-[0.85rem] border border-white/8 bg-white/[0.03] px-3 py-2"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-gv-text-muted">{item.kind}</p>
                <p className="mt-1 text-sm text-gv-text-primary">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-gv-text-muted">{item.detail}</p>
              </div>
              <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-gv-text-muted">
                {index + 1}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  const hiddenFileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*,text/*,application/pdf"
      className="hidden"
      onChange={(event) => {
        void handleFreeformFileChange(event);
      }}
    />
  );

  if (!blueprint || !workingBlueprint) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-gv-bg-deep/80 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gv-aurora-amber">Freeform entry</p>
            <h2 className="mt-2 text-2xl font-semibold text-gv-text-primary">Start anywhere.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gv-text-secondary">
              No blueprint yet? That's fine. Start with a thought, a title, three words, or a rough
              note and I'll turn it into a first draft.
            </p>

            <label className="mt-5 block">
              <span className="text-xs uppercase tracking-[0.22em] text-gv-text-muted">What are you making?</span>
              <textarea
                value={freeformDraft}
                onChange={(event) => setFreeformDraft(event.target.value)}
                placeholder="A title, a fragment, a memory, a starting point..."
                className="mt-2 min-h-[240px] w-full rounded-[1rem] border border-white/10 bg-black/25 px-4 py-3 text-base leading-6 text-gv-text-primary outline-none transition-colors placeholder:text-gv-text-muted focus:border-gv-aurora-cyan/30"
              />
            </label>

            {inspirationImportPanel}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCreateFreeformBlueprint}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gv-aurora-cyan/25 bg-gv-aurora-cyan/10 px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:bg-gv-aurora-cyan/14"
              >
                <Sparkles className="h-4 w-4" />
                Create blueprint
              </button>
              <button
                type="button"
                onClick={startVoiceNoteCapture}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm text-gv-text-primary transition-colors ${
                  isListening
                    ? "border-rose-300/25 bg-rose-300/10 hover:bg-rose-300/14"
                    : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Record voice note
                </button>
              </div>
            {hiddenFileInput}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gv-aurora-amber">Art Teacher</p>
            <div className="mt-3 space-y-3">
              {conversation.map((line, index) => (
                <div
                  key={`${index}-${line}`}
                  className="rounded-[1rem] border border-white/8 bg-black/20 px-3 py-2 text-sm leading-6 text-gv-text-secondary"
                >
                  {line}
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleRefine();
                  }
                }}
                placeholder="Ask the Art Teacher anything..."
                rows={2}
                className="flex-1 resize-none rounded-[1rem] border border-white/10 bg-black/25 px-3 py-2 text-sm text-gv-text-primary outline-none transition-colors placeholder:text-gv-text-muted focus:border-gv-aurora-amber/30"
              />
              <button
                type="button"
                onClick={() => void handleRefine()}
                disabled={!chatInput.trim()}
                className="inline-flex min-h-11 items-center gap-2 self-end rounded-full border border-gv-aurora-amber/25 bg-gv-aurora-amber/10 px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:bg-gv-aurora-amber/14 disabled:opacity-30"
              >
                <Sparkles className="h-4 w-4" />
                Send
              </button>
            </div>
            <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-gv-text-secondary">
              The blueprint library will open as soon as you create the first draft.
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.5rem] border border-white/10 bg-gv-bg-deep/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gv-aurora-amber">Generative draft</p>
              <h2 className="mt-2 text-2xl font-semibold text-gv-text-primary">Materialize the next version.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gv-text-secondary">
                Edit the draft, keep the outputs live, and push the revised blueprint to any room without losing the original source.
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-gv-text-muted">
              {blueprint.captureCount} captures
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.22em] text-gv-text-muted">Title</span>
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                className="mt-2 w-full rounded-[1rem] border border-white/10 bg-black/25 px-4 py-3 text-base text-gv-text-primary outline-none transition-colors placeholder:text-gv-text-muted focus:border-gv-aurora-cyan/30"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.22em] text-gv-text-muted">Summary</span>
              <textarea
                value={draft.summary}
                onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
                className="mt-2 min-h-[132px] w-full rounded-[1rem] border border-white/10 bg-black/25 px-4 py-3 text-base leading-6 text-gv-text-primary outline-none transition-colors placeholder:text-gv-text-muted focus:border-gv-aurora-cyan/30"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-gv-text-muted">Tags</span>
                <input
                  value={draft.tagsText}
                  onChange={(event) => setDraft((current) => ({ ...current, tagsText: event.target.value }))}
                  placeholder="comma, separated, tags"
                  className="mt-2 w-full rounded-[1rem] border border-white/10 bg-black/25 px-4 py-3 text-base text-gv-text-primary outline-none transition-colors placeholder:text-gv-text-muted focus:border-gv-aurora-cyan/30"
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-gv-text-muted">Status</span>
                <select
                  value={draft.status}
                  onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as CaptureBlueprint["status"] }))}
                  className="mt-2 w-full rounded-[1rem] border border-white/10 bg-black/25 px-4 py-3 text-base text-gv-text-primary outline-none transition-colors focus:border-gv-aurora-cyan/30"
                >
                  <option value="draft">Draft</option>
                  <option value="ready">Ready</option>
                  <option value="exported">Exported</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.22em] text-gv-text-muted">Refinement note</span>
              <textarea
                value={draft.note}
                onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
                placeholder="What should shift in the next pass?"
                className="mt-2 min-h-[126px] w-full rounded-[1rem] border border-white/10 bg-black/25 px-4 py-3 text-base leading-6 text-gv-text-primary outline-none transition-colors placeholder:text-gv-text-muted focus:border-gv-aurora-cyan/30"
              />
            </label>

            {inspirationImportPanel}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleRefine()}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:border-white/20 hover:bg-white/[0.08]"
              >
                <Sparkles className="h-4 w-4" />
                Fold note into draft
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-2 rounded-full border border-gv-aurora-cyan/25 bg-gv-aurora-cyan/10 px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:bg-gv-aurora-cyan/14"
              >
                <ArrowRight className="h-4 w-4" />
                Materialize draft
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => handleRouteBlueprint("blackboard")}
                className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-gv-text-primary transition-colors hover:border-white/20 hover:bg-white/[0.06]"
              >
                Send to Blackboard
              </button>
              <button
                type="button"
                onClick={() => handleRouteBlueprint("dynamic-inner-world")}
                className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-gv-text-primary transition-colors hover:border-white/20 hover:bg-white/[0.06]"
              >
                Send to Inner World
              </button>
              <button
                type="button"
                onClick={() => handleRouteBlueprint("external-scaffold")}
                className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-gv-text-primary transition-colors hover:border-white/20 hover:bg-white/[0.06]"
              >
                Queue to Scaffold
              </button>
            </div>

            <div className="rounded-[1.2rem] border border-white/10 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-gv-text-muted">Live draft stats</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gv-text-muted">Tags</p>
                  <p className="mt-1 text-sm text-gv-text-primary">{workingBlueprint.tags.length}</p>
                </div>
                <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gv-text-muted">Status</p>
                  <p className="mt-1 text-sm text-gv-text-primary">{workingBlueprint.status}</p>
                </div>
                <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gv-text-muted">PLK resonance</p>
                  <p className="mt-1 text-sm text-gv-text-primary">
                    {draftResonance ? `${Math.round(draftResonance.score)} / 100` : "-"}
                  </p>
                  {draftResonance?.metaphorsMatched.length ? (
                    <p className="mt-1 text-[11px] leading-5 text-gv-text-muted">
                      {draftResonance.metaphorsMatched.slice(0, 2).join(", ")}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200/72">Codex renderer preview</p>
              <h3 className="mt-2 text-xl font-semibold text-gv-text-primary">{activeDefinition.label}</h3>
              <p className="mt-2 text-sm leading-6 text-gv-text-secondary">{activeDefinition.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {OUTPUT_DEFINITIONS.map((definition) => (
                <button
                  key={definition.key}
                  type="button"
                  onClick={() => setSelectedOutput(definition.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    definition.key === selectedOutput
                      ? "border-gv-aurora-cyan/30 bg-gv-aurora-cyan/10 text-gv-text-primary"
                      : "border-white/10 bg-white/[0.03] text-gv-text-muted hover:text-gv-text-primary"
                  }`}
                >
                  {definition.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 rounded-[1rem] border border-cyan-300/10 bg-cyan-300/[0.04] p-3">
            {codexManifestPreview.map((item) => (
              <span
                key={item.format}
                className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100/85"
              >
                {item.format} · {item.status}
              </span>
            ))}
          </div>

          <div className="mt-4 min-h-[320px] overflow-hidden rounded-[1.25rem] border border-white/10 bg-gv-bg-deep/85">
            {selectedOutput === "html" || selectedOutput === "pdfHtml" ? (
              <iframe
                title={`${workingBlueprint.title} ${activeDefinition.label}`}
                srcDoc={previewOutput}
                sandbox=""
                className="h-[420px] w-full border-0 bg-white"
              />
            ) : (
              <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap p-4 text-sm leading-7 text-gv-text-secondary">
                {previewOutput}
              </pre>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:border-white/20 hover:bg-white/[0.08]"
            >
              <Copy className="h-4 w-4" />
              Copy {activeDefinition.label.toLowerCase()}
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

          <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
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
              {conversation.map((line, index) => (
                <div
                  key={`${index}-${line}`}
                  className="rounded-[1rem] border border-white/8 bg-black/20 px-3 py-2 text-sm leading-6 text-gv-text-secondary"
                >
                  {line}
                </div>
              ))}
            </div>
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
      {hiddenFileInput}
    </section>
  );
}
