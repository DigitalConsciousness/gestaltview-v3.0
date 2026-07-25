/**
 * CreationCornerPage
 * ==================
 * The workshop. The lab. The forge.
 * Hogwarts professor's laboratory × Steampunk × Tron × Hitchhiker's Guide × Vault-Tec.
 *
 * DI: The Art Teacher — "What are we actually making today?"
 *
 * Wired to:
 *   POST /api/creation-corner/synthesize
 *   GET  /api/creation-corner/artifact-types
 *   useDigitalIntelligence('creation-corner')
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { PAGE_SEO, useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { useDigitalIntelligence } from "@/hooks/useDigitalIntelligence";
import BlueprintLibrary from "@/components/BlueprintLibrary";
import RoomStateBadge from "@/components/RoomStateBadge";
import {
  readBlueprints,
  removeBlueprint,
  writeBlueprints,
  type CaptureBlueprint,
} from "@/components/Scaffold";
import {
  loadCreationCornerBlueprintsFromServer,
  materializeCreationCornerBlueprint,
  mergeCreationCornerBlueprints,
} from "@/lib/creationCornerContent";
import { appendInnerWorldArtifact, type InnerWorldArtifactRecord } from "@/lib/innerWorldFiles";

// ─── Types ───────────────────────────────────────────────────────────────────

type ArtifactType =
  | "markdown" | "blueprint_json" | "blueprint_md"
  | "image_prompt" | "image" | "audio_prompt" | "audio"
  | "share_card" | "session_recap" | "mind_map" | "agent_prompt" | "code";

type SynthesisStyle =
  | "preserve_voice" | "compress" | "expand"
  | "reframe" | "structural" | "narrative";

type Destination =
  | "creation_corner" | "dynamic_inner_world" | "scaffold_pending"
  | "download_only" | "gate_draft";

interface ArtifactResult {
  id: string;
  title: string;
  artifact_type: ArtifactType;
  content?: string;
  image_b64?: string;
  audio_b64?: string;
  image_prompt?: string;
  audio_prompt?: string;
  plk_resonance_score: number;
  generation_mode: string;
  fallback_used: boolean;
  warnings: string[];
  latency_ms: number;
  provenance?: {
    artifactId: string;
    sourceCaptureIds: string[];
    sourceHashes: string[];
    artifactHash: string;
    generatedAt: string;
    engineVersion: string;
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ARTIFACT_TYPES: { value: ArtifactType; label: string; glyph: string }[] = [
  { value: "markdown",       label: "Document",      glyph: "📄" },
  { value: "blueprint_md",   label: "Blueprint",     glyph: "🗺" },
  { value: "blueprint_json", label: "Blueprint JSON", glyph: "⚙" },
  { value: "image_prompt",   label: "Image Prompt",  glyph: "🖼" },
  { value: "image",          label: "Generate Image", glyph: "✨" },
  { value: "audio_prompt",   label: "Audio Prompt",  glyph: "🎵" },
  { value: "audio",          label: "Generate Audio", glyph: "🔊" },
  { value: "share_card",     label: "Share Card",    glyph: "📡" },
  { value: "session_recap",  label: "Session Recap", glyph: "🗒" },
  { value: "mind_map",       label: "Mind Map",      glyph: "🕸" },
  { value: "agent_prompt",   label: "Agent Prompt",  glyph: "🤖" },
  { value: "code",           label: "Code",          glyph: "💻" },
];

const SYNTHESIS_STYLES: { value: SynthesisStyle; label: string; desc: string }[] = [
  { value: "preserve_voice", label: "Preserve Voice",  desc: "Stay exactly in your register" },
  { value: "compress",       label: "Compress",        desc: "Irreducible essence only" },
  { value: "expand",         label: "Expand",          desc: "Elaborate what's implied" },
  { value: "reframe",        label: "Reframe",         desc: "New angle, same material" },
  { value: "structural",     label: "Structural",      desc: "Clean skeleton, no prose" },
  { value: "narrative",      label: "Narrative",       desc: "Flowing prose, one voice" },
];

const DESTINATIONS: { value: Destination; label: string }[] = [
  { value: "creation_corner",     label: "Keep here" },
  { value: "dynamic_inner_world", label: "→ Inner World" },
  { value: "scaffold_pending",    label: "→ Scaffold" },
  { value: "download_only",       label: "Download only" },
  { value: "gate_draft",          label: "→ Gate draft" },
];

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "/api";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resultContentToHtml(result: ArtifactResult): string {
  const content = result.content ?? result.image_prompt ?? result.audio_prompt ?? result.title;

  if (/<!doctype html|<html[\s>]/i.test(content)) {
    return content;
  }

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    :root{color-scheme:dark}body{margin:0;font-family:Inter,system-ui,sans-serif;background:#05070b;color:#f8fafc}.shell{min-height:100vh;padding:32px;background:radial-gradient(circle at top,rgba(18,214,255,.16),transparent 30%),#05070b}.frame{max-width:960px;margin:0 auto;border:1px solid rgba(255,255,255,.12);border-radius:28px;background:rgba(255,255,255,.04);overflow:hidden}.chrome{padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)}.meta{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.5)}h1{margin:.45rem 0 0;font-size:32px}.body{padding:24px;line-height:1.7}pre{white-space:pre-wrap;word-break:break-word;font:inherit;color:rgba(255,255,255,.76)}
  </style></head><body><div class="shell"><article class="frame"><div class="chrome"><div class="meta">Creation Corner · ${escapeHtml(result.artifact_type)} · ${escapeHtml(result.generation_mode)}</div><h1>${escapeHtml(result.title)}</h1></div><div class="body"><pre>${escapeHtml(content)}</pre></div></article></div></body></html>`;
}

function appendResultToInnerWorld(result: ArtifactResult, userId: string): void {
  const now = new Date().toISOString();
  const artifact: InnerWorldArtifactRecord = {
    id: result.id,
    userId,
    title: result.title,
    summary: (result.content ?? result.image_prompt ?? result.audio_prompt ?? result.title).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240),
    sourceFileId: null,
    html: resultContentToHtml(result),
    thumbnailUrl: undefined,
    createdAt: result.provenance?.generatedAt ?? now,
    updatedAt: now,
    originRoom: "creation_corner",
    evidenceNodeIds: [result.provenance?.artifactHash ?? result.id],
    tags: Array.from(new Set(["creation-corner", result.artifact_type, result.generation_mode])),
  };

  appendInnerWorldArtifact(artifact);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CreationCornerPage() {
  useSEO(PAGE_SEO.creationCorner);
  const { user } = useAuth();
  const { di, isReady, messages, sendMessage } = useDigitalIntelligence("creation-corner");

  // ── Blueprint state ──────────────────────────────────────────────────────
  const [blueprints, setBlueprints]               = useState<CaptureBlueprint[]>(() => readBlueprints());
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null);

  // ── Synthesis controls ───────────────────────────────────────────────────
  const [artifactType, setArtifactType]   = useState<ArtifactType>("markdown");
  const [synthStyle, setSynthStyle]       = useState<SynthesisStyle>("preserve_voice");
  const [destination, setDestination]     = useState<Destination>("creation_corner");
  const [customTitle, setCustomTitle]     = useState("");
  const [freeText, setFreeText]           = useState("");

  // ── Result state ─────────────────────────────────────────────────────────
  const [result, setResult]         = useState<ArtifactResult | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthError, setSynthError] = useState<string | null>(null);

  // ── DI chat ──────────────────────────────────────────────────────────────
  const [diInput, setDiInput]       = useState("");
  const [diOpen, setDiOpen]         = useState(true);
  const chatEndRef                  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Blueprint hydration ──────────────────────────────────────────────────
  useEffect(() => {
    const refresh = () => setBlueprints(readBlueprints());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("gestaltview:creation-blueprints-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("gestaltview:creation-blueprints-updated", refresh);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      if (!user?.id) return;
      const remote = await loadCreationCornerBlueprintsFromServer();
      if (cancelled || !remote) return;
      const next = mergeCreationCornerBlueprints(
        readBlueprints(),
        remote.map(materializeCreationCornerBlueprint),
      );
      writeBlueprints(next);
    };
    void hydrate();
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    if (!selectedBlueprintId && blueprints[0]) {
      setSelectedBlueprintId(blueprints[0].id);
    }
  }, [blueprints, selectedBlueprintId]);

  const selectedBlueprint = useMemo(
    () => blueprints.find((b) => b.id === selectedBlueprintId) ?? blueprints[0] ?? null,
    [blueprints, selectedBlueprintId],
  );

  const handleDeleteBlueprint = (blueprint: CaptureBlueprint) => {
    if (!window.confirm(`Remove "${blueprint.title}" from the workshop?`)) return;
    const next = removeBlueprint(blueprint.id);
    setBlueprints(next);
    setSelectedBlueprintId((cur) =>
      cur !== blueprint.id ? cur : next[0]?.id ?? null
    );
  };

  // ── Synthesis ────────────────────────────────────────────────────────────
  const handleSynthesize = async () => {
    const textInput = freeText.trim() ||
      (selectedBlueprint ? JSON.stringify(selectedBlueprint) : "");

    if (!textInput) {
      setSynthError("Add some raw material first — text, a blueprint, or anything.");
      return;
    }

    setIsSynthesizing(true);
    setSynthError(null);
    setResult(null);

    try {
      const resp = await fetch(`${API_BASE}/creation-corner/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id:        user?.id ?? "anonymous",
          text:           textInput,
          artifact_type:  artifactType,
          synthesis_style: synthStyle,
          destination,
          custom_title:   customTitle || undefined,
          consent: {
            allow_external_image_analysis: artifactType === "image",
            allow_external_audio_analysis: artifactType === "audio",
            allow_data_persistence:        true,
          },
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ detail: resp.statusText }));
        throw new Error(err.detail ?? "Synthesis failed");
      }

      const data: ArtifactResult = await resp.json();
      setResult(data);
      if (destination === "dynamic_inner_world") {
        appendResultToInnerWorld(data, user?.id ?? "anonymous");
        toast.success("Sent to Dynamic Inner World.");
      } else {
        toast.success("Artifact synthesized.");
      }
    } catch (err: any) {
      setSynthError(err.message ?? "Something went wrong in the forge.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleDownload = () => {
    if (!result?.content) return;
    const ext = result.artifact_type === "blueprint_json" ? "json" :
                result.artifact_type === "code" ? "txt" : "md";
    const blob = new Blob([result.content], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${result.title.slice(0, 40).replace(/[^a-z0-9]+/gi, "-")}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-gv-bg-void text-gv-text-primary"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, rgba(14,165,233,0.07) 0%, transparent 55%), " +
          "radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.06) 0%, transparent 50%), " +
          "radial-gradient(ellipse at 50% 90%, rgba(251,146,60,0.04) 0%, transparent 50%), " +
          "#080c10",
      }}
    >
      {/* Atmospheric grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(14,165,233,0.8) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(14,165,233,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/">
              <a className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gv-text-secondary transition-colors hover:border-sky-500/30 hover:text-gv-text-primary">
                ← Home
              </a>
            </Link>
            <RoomStateBadge slug="creation-corner" />
          </div>

          {/* DI toggle */}
          <button
            onClick={() => setDiOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300 transition-colors hover:bg-purple-500/20"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" style={{ animation: isReady ? "pulse 2s infinite" : "none" }} />
            {di.publicName}
          </button>
        </header>

        {/* ── Workshop title ──────────────────────────────────────────────── */}
        <div className="mt-8 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <span className="text-sky-400">⚗</span> The Workshop
          </h1>
          <p className="mt-1 text-sm text-gv-text-secondary">
            Raw material in. Finished artifacts out. The Art Teacher sees what it wants to become.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">

          {/* ── Left column: workbench ──────────────────────────────────── */}
          <div className="space-y-5">

            {/* Raw material input */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-sky-400">Raw Material</h2>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Paste anything here — notes, fragments, voice transcripts, half-formed ideas. The Art Teacher will know what to do."
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-7 text-gv-text-primary placeholder:text-gv-text-secondary/50 focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/20"
                rows={6}
              />
              {selectedBlueprint && !freeText && (
                <p className="mt-2 text-xs text-gv-text-secondary">
                  Using blueprint: <span className="text-sky-400">{selectedBlueprint.title}</span>
                </p>
              )}
            </section>

            {/* Artifact type grid */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-sky-400">Output Format</h2>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {ARTIFACT_TYPES.map((at) => (
                  <button
                    key={at.value}
                    onClick={() => setArtifactType(at.value)}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs transition-all ${
                      artifactType === at.value
                        ? "border-sky-500/60 bg-sky-500/10 text-sky-300"
                        : "border-white/10 bg-white/[0.02] text-gv-text-secondary hover:border-white/20 hover:text-gv-text-primary"
                    }`}
                  >
                    <span className="text-lg">{at.glyph}</span>
                    <span className="text-center leading-tight">{at.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Style + destination row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-sky-400">Synthesis Style</h2>
                <div className="space-y-1">
                  {SYNTHESIS_STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSynthStyle(s.value)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-all ${
                        synthStyle === s.value
                          ? "bg-sky-500/10 text-sky-300"
                          : "text-gv-text-secondary hover:bg-white/[0.04] hover:text-gv-text-primary"
                      }`}
                    >
                      <span className="font-medium">{s.label}</span>
                      <span className="text-[10px] opacity-60">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-sky-400">Destination</h2>
                <div className="space-y-1">
                  {DESTINATIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDestination(d.value)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-all ${
                        destination === d.value
                          ? "bg-purple-500/10 text-purple-300"
                          : "text-gv-text-secondary hover:bg-white/[0.04] hover:text-gv-text-primary"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Custom title (optional)"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-gv-text-primary placeholder:text-gv-text-secondary/50 focus:border-sky-500/40 focus:outline-none"
                  />
                </div>
              </section>
            </div>

            {/* Forge button */}
            <button
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="w-full rounded-2xl border border-sky-500/30 bg-sky-500/10 py-4 text-sm font-semibold text-sky-300 transition-all hover:bg-sky-500/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSynthesizing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                  Forging…
                </span>
              ) : (
                "⚗ Synthesize"
              )}
            </button>

            {/* Error */}
            {synthError && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                {synthError}
              </p>
            )}

            {/* Result panel */}
            {result && (
              <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 backdrop-blur-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-emerald-300">{result.title}</h3>
                    <p className="mt-0.5 text-[10px] text-gv-text-secondary">
                      {result.artifact_type} · {result.generation_mode} · PLK {(result.plk_resonance_score * 100).toFixed(0)}% · {result.latency_ms.toFixed(0)}ms
                    </p>
                  </div>
                  {result.content && (
                    <button
                      onClick={handleDownload}
                      className="shrink-0 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20"
                    >
                      Download
                    </button>
                  )}
                </div>

                {result.content && (
                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-6 text-gv-text-primary">
                    {result.content}
                  </pre>
                )}

                {result.image_b64 && (
                  <img
                    src={`data:image/jpeg;base64,${result.image_b64}`}
                    alt={result.title}
                    className="mt-3 w-full rounded-xl border border-white/10"
                  />
                )}

                {result.image_prompt && !result.image_b64 && (
                  <div className="mt-3">
                    <p className="mb-1 text-[10px] text-gv-text-secondary">Image prompt ready:</p>
                    <pre className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-sky-200">{result.image_prompt}</pre>
                  </div>
                )}

                {result.warnings.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {result.warnings.map((w, i) => (
                      <li key={i} className="text-[10px] text-amber-400/70">{w}</li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* Blueprint library */}
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-sky-400">Blueprint Library</h2>
              <BlueprintLibrary
                blueprints={blueprints}
                selectedId={selectedBlueprint?.id ?? null}
                onSelect={(b) => setSelectedBlueprintId(b.id)}
                onDelete={handleDeleteBlueprint}
              />
            </section>
          </div>

          {/* ── Right column: DI panel ──────────────────────────────────── */}
          {diOpen && (
            <aside className="flex flex-col rounded-2xl border border-purple-500/20 bg-white/[0.02] backdrop-blur-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-purple-300">{di.publicName}</p>
                  <p className="text-[10px] text-gv-text-secondary">Creation Corner · Art Teacher</p>
                </div>
                <button
                  onClick={() => setDiOpen(false)}
                  className="text-xs text-gv-text-secondary hover:text-gv-text-primary"
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-6 ${
                        msg.role === "user"
                          ? "bg-sky-500/15 text-sky-100"
                          : "bg-purple-500/10 text-purple-100"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/10 px-4 py-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={diInput}
                    onChange={(e) => setDiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (diInput.trim()) {
                          void sendMessage(diInput.trim());
                          setDiInput("");
                        }
                      }
                    }}
                    placeholder="Ask the Art Teacher…"
                    className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-gv-text-primary placeholder:text-gv-text-secondary/50 focus:border-purple-500/40 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (diInput.trim()) {
                        void sendMessage(diInput.trim());
                        setDiInput("");
                      }
                    }}
                    className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-xs text-purple-300 hover:bg-purple-500/20"
                  >
                    →
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
