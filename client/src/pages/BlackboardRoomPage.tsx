import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Clock3,
  Copy,
  Download,
  Mic,
  Paperclip,
  Send,
  SquareLibrary,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { PAGE_SEO, useSEO } from "@/hooks/useSEO";
import { useBillySection } from "@/components/Billy";
import BabylonAtmosphere from "@/components/BabylonAtmosphere";
import BlackboardCompanionChat from "@/components/capture/BlackboardCompanionChat";
import { ThinkingAnimation } from "@/components/thinking/ThinkingAnimation";
import RoomStateBadge from "@/components/RoomStateBadge";
import SessionRecapGenerator, {
  type RecapArtifact,
  type RecapMessage,
} from "@/components/SessionRecapGenerator";
import {
  routeBlackboardResponder,
  type BlackboardResponderSource,
} from "@/lib/blackboardDiRouting";
import { getAllEmbodimentProfiles } from "@/lib/embodimentRuntime";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  appendBlueprint,
  appendScaffoldQueue,
  buildBlueprintFromCaptures,
  createCaptureOrb,
  readSavedCaptures,
  readInnerWorldCaptures,
  updateSavedCapture,
  type CaptureOrb,
} from "@/components/Scaffold";
import { PERSONAS } from "@/data/personas";
import { getRoomPersona, setRoomPersona } from "@/lib/personaManager";
import { uploadUserFileToServer } from "@/lib/fileStorage";
import {
  appendUserFile,
  createUserFileRecord,
  type UserFileRecord,
} from "@/lib/innerWorldFiles";
import { enrichBlackboardCaptureWithResonance } from "@/lib/genEngineRoomWiring";
import { routeBlackboardCaptureThroughPipeline } from "@/lib/profilePipeline/blackboardRouting";
import {
  readUserSurfaceSettings,
  USER_SURFACE_SETTINGS_EVENT,
  type UserSurfaceSettings,
} from "@/lib/userSurfaceSettings";
import { TRANSCRIPTORY_BLACKBOARD_HANDOFF_KEY } from "@/lib/transcriptory";
import {
  acceptTranscriptoryHandoffInBlackboard,
  appendBlackboardProfileProposal,
  buildBlackboardProfileProposal,
  offerBlackboardBlueprint,
  offerBlackboardBlueprintToScaffold,
} from "@/lib/blackboardRuntimeHandoffs";

// ─── Types ─────────────────────────────────────────────────────────────────────

type CouncilMetadata = {
  stance: string;
  concerns: string[];
  recommendedNextStep?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "di";
  text: string;
  createdAt: string;
  personaSlug?: string;
  responseSource?: BlackboardResponderSource;
  captureId?: string;
  captureResonanceScore?: number;
  councilMetadata?: CouncilMetadata;
  sourceCitation?: {
    sourceRef: string;
    handoffId?: string;
    status: "accepted" | "local_only" | "failed";
  };
  persistenceScope?: "local_only";
};

type Persona = (typeof PERSONAS)[number];

// ─── Constants ─────────────────────────────────────────────────────────────────

const CHAT_STORAGE_KEY = "gv.blackboard.chat.v1";
const RECAP_STORAGE_KEY = "gv.blackboard.recap.blackboard-room.v1";
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
const BLACKBOARD_THINKING_MESSAGES = [
  "Billy is pulling the thread through the Loom.",
  "The Blackboard is sorting the scraps into something useful.",
  "Context is arriving from the capture, one shard at a time.",
  "The answer is somewhere between the note and the meaning.",
  "Checking the room for a better version of the same thought.",
];

// ─── Council metadata builder ──────────────────────────────────────────────────

function buildCouncilMetadata(
  text: string,
  personaName: string,
): CouncilMetadata {
  // Parse stance from first sentence, concerns from body, next step from last sentence
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const stance = sentences[0] ?? `${personaName} is present.`;
  const concerns = sentences
    .slice(1, -1)
    .filter((s) => s.length > 20)
    .slice(0, 3);
  const recommendedNextStep =
    sentences.length > 2 ? sentences[sentences.length - 1] : undefined;
  return { stance, concerns, recommendedNextStep };
}

// ─── Scoped Styles ─────────────────────────────────────────────────────────────

const BBR_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cabin+Sketch:wght@400;700&display=swap');

  .bbr-hero-title {
    font-family: 'Cabin Sketch', cursive;
    font-size: clamp(2.6rem, 7vw, 4.2rem);
    font-weight: 700;
    background: linear-gradient(135deg, var(--bbr-persona-hue, #32b8c6) 0%, color-mix(in srgb, var(--bbr-persona-hue, #32b8c6) 78%, #2da6b2) 28%, #ff5459 62%, var(--bbr-persona-hue, #32b8c6) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    line-height: 1.08;
    margin: 0;
    filter: drop-shadow(0 0 24px color-mix(in srgb, var(--bbr-persona-hue, #32b8c6) 38%, transparent));
    letter-spacing: -0.01em;
  }

  .bbr-hero-eyebrow {
    font-family: 'Cabin Sketch', cursive;
    font-size: clamp(0.72rem, 1.6vw, 0.85rem);
    color: color-mix(in srgb, var(--bbr-persona-hue, #32b8c6) 48%, transparent);
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin-top: 8px;
    font-weight: 400;
  }

  .bbr-canvas-wrap {
    width: 100%;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    border: 1px solid color-mix(in srgb, var(--bbr-persona-hue, #32b8c6) 18%, transparent);
    box-shadow: 0 12px 60px rgba(0,0,0,0.45), inset 0 0 80px color-mix(in srgb, var(--bbr-persona-hue, #32b8c6) 4%, transparent);
    height: 160px;
  }

  .bbr-canvas-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(3,4,10,0.72) 100%);
    pointer-events: none;
  }

  .bbr-glass-input {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(255,255,255,0.04);
    border: 1px solid color-mix(in srgb, var(--bbr-persona-hue, #32b8c6) 22%, transparent);
    border-radius: 20px;
    transition: border-color 200ms ease, box-shadow 200ms ease;
    box-shadow: 0 4px 36px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.055);
    flex-shrink: 0;
  }

  .bbr-glass-input:focus-within {
    border-color: color-mix(in srgb, var(--bbr-persona-hue, #32b8c6) 46%, transparent);
    box-shadow: 0 4px 48px rgba(0,0,0,0.42), 0 0 0 1px color-mix(in srgb, var(--bbr-persona-hue, #32b8c6) 16%, transparent), inset 0 1px 0 rgba(255,255,255,0.07);
  }

  .bbr-glass-toolbar {
    border-top: 1px solid rgba(255,255,255,0.065);
    border-radius: 0 0 19px 19px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }

  .bbr-textarea {
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    width: 100%;
    color: rgba(255,255,255,0.88);
    font-family: 'Geist', 'Inter', system-ui, sans-serif;
    font-size: 1rem;
    line-height: 1.65;
    min-height: 60px;
    max-height: 180px;
    padding: 0;
    overflow-y: auto;
    caret-color: #32b8c6;
  }
  .bbr-textarea::placeholder { color: rgba(255,255,255,0.2); }

  .bbr-di-select {
    background: rgba(255,255,255,0.04);
    border: 1px solid color-mix(in srgb, var(--bbr-persona-hue, #32b8c6) 18%, transparent);
    border-radius: 8px;
    color: color-mix(in srgb, var(--bbr-persona-hue, #32b8c6) 82%, white);
    font-family: 'Geist', 'Inter', system-ui, sans-serif;
    font-size: 1rem;
    padding: 5px 26px 5px 10px;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2332b8c6' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 10px;
    cursor: pointer;
    outline: none;
    transition: border-color 150ms ease;
    min-width: 190px;
    min-height: 44px;
    letter-spacing: 0.01em;
  }
  .bbr-di-select:hover { border-color: color-mix(in srgb, var(--bbr-persona-hue, #32b8c6) 40%, transparent); }
  .bbr-di-select option { background: #0d1314; color: #f0f0f0; }

  .bbr-send-btn {
    width: 44px; height: 44px;
    border-radius: 10px;
    background: linear-gradient(135deg, #1a8896, #32b8c6);
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: all 150ms ease;
    box-shadow: 0 0 14px rgba(50,184,198,0.32);
    color: white;
  }
  .bbr-send-btn:hover:not(:disabled) { transform: scale(1.06); box-shadow: 0 0 22px rgba(50,184,198,0.52); }
  .bbr-send-btn:active:not(:disabled) { transform: scale(0.94); }
  .bbr-send-btn:disabled { opacity: 0.32; cursor: not-allowed; }

  .bbr-icon-btn {
    width: 44px; height: 44px;
    border-radius: 8px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: all 150ms ease;
    color: rgba(255,255,255,0.38);
  }
  .bbr-icon-btn:hover { border-color: rgba(50,184,198,0.36); color: rgba(50,184,198,0.82); background: rgba(50,184,198,0.07); }
  .bbr-icon-btn.recording { border-color: #ff5459; color: #ff5459; background: rgba(255,84,89,0.1); animation: bbr-pulse 1.2s ease infinite; }

  /* Message bubbles */
  .bbr-bubble-di {
    background: rgba(50,184,198,0.07);
    border: 1px solid rgba(50,184,198,0.14);
    border-radius: 16px 16px 16px 4px;
    padding: 13px 17px;
    max-width: 80%;
  }
  .bbr-bubble-di.di-response {
    border-color: color-mix(in srgb, var(--bbr-bubble-hue, var(--bbr-persona-hue, #32b8c6)) 42%, rgba(255,255,255,0.1));
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--bbr-bubble-hue, var(--bbr-persona-hue, #32b8c6)) 16%, transparent), 0 0 24px color-mix(in srgb, var(--bbr-bubble-hue, var(--bbr-persona-hue, #32b8c6)) 14%, transparent);
  }
  .bbr-bubble-user {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px 16px 4px 16px;
    padding: 13px 17px;
    max-width: 80%;
  }
  .bbr-bubble-user.resonance-response {
    border-color: rgba(127,233,255,0.34);
    box-shadow: 0 0 22px rgba(127,233,255,0.12);
  }

  /* Council card */
  .bbr-council-card {
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(0,0,0,0.22);
    padding: 10px 14px;
    margin-top: 8px;
    max-width: 80%;
  }
  .bbr-council-stance {
    font-family: 'Cabin Sketch', cursive;
    font-size: 0.82rem;
    color: rgba(210,245,250,0.72);
    font-style: italic;
    margin: 0 0 6px;
  }
  .bbr-council-concern {
    font-family: 'Geist','Inter',system-ui,sans-serif;
    font-size: 0.75rem;
    color: rgba(255,255,255,0.5);
    line-height: 1.5;
    padding-left: 10px;
    border-left: 2px solid rgba(255,255,255,0.1);
    margin: 3px 0;
  }
  .bbr-council-nextstep {
    font-family: 'Geist','Inter',system-ui,sans-serif;
    font-size: 0.72rem;
    color: rgba(50,184,198,0.62);
    letter-spacing: 0.06em;
    margin-top: 8px;
  }
  .bbr-council-label {
    font-family: 'Geist','Inter',system-ui,sans-serif;
    font-size: 0.6rem;
    color: rgba(255,255,255,0.22);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  /* Billy synthesis block */
  .bbr-billy-synthesis {
    border-radius: 18px;
    border: 1px solid rgba(50,184,198,0.18);
    background: rgba(50,184,198,0.05);
    padding: 14px 18px;
    margin-top: 12px;
    max-width: 90%;
  }
  .bbr-billy-synthesis-label {
    font-family: 'Geist','Inter',system-ui,sans-serif;
    font-size: 0.6rem;
    color: rgba(50,184,198,0.48);
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .bbr-billy-synthesis-text {
    font-family: 'Cabin Sketch', cursive;
    font-size: 0.88rem;
    color: rgba(210,245,250,0.82);
    line-height: 1.7;
    white-space: pre-wrap;
    margin: 0;
  }

  /* DI text — Cabin Sketch chalk feel */
  .bbr-text-di {
    font-family: 'Cabin Sketch', cursive;
    font-size: 0.95rem;
    line-height: 1.7;
    color: rgba(210,245,250,0.9);
    font-weight: 400;
    white-space: pre-wrap;
    margin: 0;
  }
  /* User text — clean system font */
  .bbr-text-user {
    font-family: 'Geist', 'Inter', system-ui, sans-serif;
    font-size: 0.9rem;
    line-height: 1.65;
    color: rgba(255,255,255,0.86);
    font-weight: 400;
    white-space: pre-wrap;
    margin: 0;
  }

  .bbr-label-di {
    font-family: 'Cabin Sketch', cursive;
    font-size: 0.68rem;
    color: rgba(50,184,198,0.55);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .bbr-label-user {
    font-family: 'Geist', 'Inter', system-ui, sans-serif;
    font-size: 0.68rem;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 5px;
    text-align: right;
  }

  /* Per-DI orb avatar in label */
  .bbr-di-orb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 6px currentColor;
  }

  .bbr-scroll::-webkit-scrollbar { width: 3px; }
  .bbr-scroll::-webkit-scrollbar-track { background: transparent; }
  .bbr-scroll::-webkit-scrollbar-thumb { background: rgba(50,184,198,0.18); border-radius: 3px; }
  .bbr-scroll::-webkit-scrollbar-thumb:hover { background: rgba(50,184,198,0.36); }
  .bbr-scroll {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .bbr-scroll > * {
    flex: 0 0 auto;
  }
  .bbr-message-row {
    flex: 0 0 auto;
    min-height: max-content;
  }
  .bbr-message-stack {
    min-width: 0;
    max-width: calc(100% - 3rem);
  }

  @keyframes bbr-pulse {
    0%,100% { box-shadow: 0 0 10px rgba(255,84,89,0.25); }
    50% { box-shadow: 0 0 20px rgba(255,84,89,0.56); }
  }
  @keyframes bbr-fadein {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .bbr-msg-enter { animation: bbr-fadein 280ms ease forwards; }

  /* Promote bar */
  .bbr-promote-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 10px 14px;
    border-radius: 14px;
    border: 1px solid rgba(50,184,198,0.14);
    background: rgba(50,184,198,0.04);
    flex-shrink: 0;
  }
  .bbr-promote-label {
    font-family: 'Geist','Inter',system-ui,sans-serif;
    font-size: 0.68rem;
    color: rgba(50,184,198,0.5);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    flex-shrink: 0;
  }
  .bbr-promote-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 99px;
    border: 1px solid rgba(50,184,198,0.22);
    background: rgba(50,184,198,0.07);
    color: rgba(210,245,250,0.82);
    font-family: 'Geist','Inter',system-ui,sans-serif;
    font-size: 0.78rem;
    cursor: pointer;
    transition: all 140ms ease;
    min-height: 36px;
  }
  .bbr-promote-btn:hover { background: rgba(50,184,198,0.14); border-color: rgba(50,184,198,0.4); color: #fff; }
  .bbr-promote-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .bbr-promote-btn.scaffold {
    border-color: rgba(245,158,11,0.28);
    background: rgba(245,158,11,0.06);
    color: rgba(253,230,138,0.82);
  }
  .bbr-promote-btn.scaffold:hover { background: rgba(245,158,11,0.14); border-color: rgba(245,158,11,0.48); color: #fff; }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function createId(prefix = "chat"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function readStoredMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function writeStoredMessages(messages: ChatMessage[]): void {
  try {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // private mode — ignore
  }
}

function clearStoredMessages(): void {
  try {
    window.localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch {
    // private mode — ignore
  }
}

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
}

function isSessionScaffoldMessage(message: ChatMessage): boolean {
  if (message.role !== "di") return false;
  const normalized = message.text.trim().toLowerCase();
  if (!normalized) return true;

  const scaffoldPatterns = [
    /^it'?s nice to have some company[.!]?$/i,
    /^i'?ve been sitting here,\s*surrounded by the architecture of gestaltview/i,
    /^what brings you here today/i,
    new RegExp(`^i hear ${"you"}[.!]?\\s*let'?s keep weaving`, "i"),
    /^i'?m here and listening/i,
    /^local fallback is active/i,
    /^the live embodiment layer is offline/i,
  ];

  return scaffoldPatterns.some((pattern) => pattern.test(normalized));
}

function summarizeMessages(messages: ChatMessage[]): string[] {
  const lines = messages
    .filter((m) => !isSessionScaffoldMessage(m))
    .map(
      (m) =>
        `${m.role === "user" ? "You" : (m.personaSlug ?? "DI")}: ${m.text.trim()}`,
    )
    .filter(Boolean);
  return lines.slice(0, 6).length > 0
    ? lines.slice(0, 6)
    : ["The room stayed open."];
}

function buildSummaryBlueprint(messages: ChatMessage[]): CaptureOrb[] {
  return messages
    .filter((m) => !isSessionScaffoldMessage(m))
    .map((m) =>
      createCaptureOrb({
        text: `${m.role === "user" ? "You" : (m.personaSlug ?? "DI")}: ${m.text}`,
        source: "typed",
        action: "save",
        context: "Blackboard Room summary",
        meaning: m.role === "user" ? "User message" : "DI response",
      }),
    )
    .filter((orb): orb is CaptureOrb => Boolean(orb));
}

function roomFallbackResponse(): string {
  return "The live embodiment layer is offline for a moment, but the thread stays visible here.";
}

function formatSessionDuration(totalMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(totalMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0)
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// ─── Billy Synthesis ───────────────────────────────────────────────────────────

function buildBillySynthesis(roundtableMessages: ChatMessage[]): string {
  const diMessages = roundtableMessages.filter((m) => m.role === "di");
  if (diMessages.length === 0) return "";
  const voices = diMessages.map((m) => m.personaSlug ?? "DI").join(", ");
  const keyThemes = diMessages
    .map((m) => m.councilMetadata?.stance ?? m.text.split(/[.!?]/)[0])
    .filter(Boolean)
    .slice(0, 3)
    .join(" · ");
  return `The council has spoken. ${voices} each brought their lens.\n\nAt the center: ${keyThemes}\n\nThe thread holds. What moves forward is yours to decide.`;
}

// ─── Babylon Hero Canvas ────────────────────────────────────────────────────────

function BabylonHeroCanvas({ hue = "#32b8c6" }: { hue?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    let engine: any;
    let disposed = false;
    let resizeHandler: (() => void) | null = null;

    const init = async () => {
      try {
        const BABYLON = await import("@babylonjs/core");
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (disposed) return;

        engine = new BABYLON.Engine(canvas, true, {
          preserveDrawingBuffer: true,
          alpha: true,
        });
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

        const camera = new BABYLON.ArcRotateCamera(
          "cam",
          -Math.PI / 2,
          Math.PI / 3,
          13,
          BABYLON.Vector3.Zero(),
          scene,
        );
        camera.lowerRadiusLimit = 8;
        camera.upperRadiusLimit = 20;
        camera.attachControl(canvas, true);

        const accentColor = BABYLON.Color3.FromHexString(hue);

        const ambient = new BABYLON.HemisphericLight(
          "amb",
          new BABYLON.Vector3(0, 1, 0),
          scene,
        );
        ambient.intensity = 0.28;
        ambient.diffuse = accentColor.scale(0.82);
        ambient.groundColor = new BABYLON.Color3(0.04, 0.04, 0.08);

        const pt1 = new BABYLON.PointLight(
          "pt1",
          new BABYLON.Vector3(0, 4, 0),
          scene,
        );
        pt1.diffuse = accentColor;
        pt1.intensity = 1.4;

        const pt2 = new BABYLON.PointLight(
          "pt2",
          new BABYLON.Vector3(4, -2, 2),
          scene,
        );
        pt2.diffuse = BABYLON.Color3.FromHexString("#ff5459");
        pt2.intensity = 0.65;

        const knot = BABYLON.MeshBuilder.CreateTorusKnot(
          "knot",
          {
            radius: 1.9,
            tube: 0.32,
            radialSegments: 128,
            tubularSegments: 48,
            p: 3,
            q: 7,
          },
          scene,
        );
        const knotMat = new BABYLON.StandardMaterial("km", scene);
        knotMat.emissiveColor = accentColor.scale(0.72);
        knot.material = knotMat;

        const knotWire = knot.clone("knotW");
        const wireMat = new BABYLON.StandardMaterial("wm", scene);
        wireMat.emissiveColor = accentColor.scale(0.96);
        wireMat.wireframe = true;
        knotWire.material = wireMat;
        knotWire.scaling = new BABYLON.Vector3(1.012, 1.012, 1.012);

        const particles: {
          mesh: any;
          r: number;
          theta: number;
          phi: number;
          speed: number;
          phase: number;
        }[] = [];
        for (let i = 0; i < 55; i++) {
          const sp = BABYLON.MeshBuilder.CreateSphere(
            `p${i}`,
            { diameter: 0.04 + Math.random() * 0.06 },
            scene,
          );
          const pm = new BABYLON.StandardMaterial(`pm${i}`, scene);
          const t = Math.random();
          pm.emissiveColor = BABYLON.Color3.Lerp(
            accentColor,
            BABYLON.Color3.FromHexString("#ffffff"),
            t * 0.45,
          );
          sp.material = pm;
          particles.push({
            mesh: sp,
            r: 3.2 + Math.random() * 2.4,
            theta: Math.random() * Math.PI * 2,
            phi: Math.random() * Math.PI,
            speed: 0.003 + Math.random() * 0.008,
            phase: Math.random() * Math.PI * 2,
          });
        }

        let t = 0;
        let lowPerfStrikes = 0;
        let didCollapse = false;
        engine.runRenderLoop(() => {
          if (didCollapse) return;
          const fps = engine.getFps();
          if (fps < 28) {
            lowPerfStrikes += 1;
            if (lowPerfStrikes > 90) {
              didCollapse = true;
              setIsCollapsed(true);
              engine.stopRenderLoop();
              return;
            }
          } else {
            lowPerfStrikes = 0;
          }

          t += 0.008;
          knot.rotation.y = t * 0.38;
          knot.rotation.x = Math.sin(t * 0.28) * 0.18;
          knotWire.rotation = knot.rotation.clone();

          particles.forEach((p) => {
            p.theta += p.speed;
            const r = p.r + Math.sin(t + p.phase) * 0.36;
            p.mesh.position.x = r * Math.sin(p.phi) * Math.cos(p.theta);
            p.mesh.position.y = r * Math.cos(p.phi) * 0.48;
            p.mesh.position.z = r * Math.sin(p.phi) * Math.sin(p.theta);
          });

          pt1.intensity = 1.2 + Math.sin(t * 1.4) * 0.36;
          pt2.intensity = 0.5 + Math.sin(t * 1.1 + 1) * 0.28;
          scene.render();
        });

        resizeHandler = () => engine.resize();
        window.addEventListener("resize", resizeHandler);
      } catch (e) {
        console.warn("[BabylonHeroCanvas] unavailable:", e);
      }
    };

    init();
    return () => {
      disposed = true;
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (engine) engine.dispose();
    };
  }, [hue]);

  return (
    <div className="bbr-canvas-wrap">
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          opacity: isCollapsed ? 0.12 : 1,
          transition: "opacity 220ms ease",
        }}
      />
      <div className="bbr-canvas-vignette" />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BlackboardRoomPage() {
  useSEO(PAGE_SEO.blackboardRoom);
  useBillySection("blackboard-room");
  const [, setLocation] = useLocation();
  const { user, tier } = useAuth();

  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    readStoredMessages(),
  );
  const [selectedPersonaSlugs, setSelectedPersonaSlugs] = useState<string[]>(
    () => [getRoomPersona("blackboard").slug],
  );
  const [isRoundtable, setIsRoundtable] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [isBlueprintDrawerOpen, setIsBlueprintDrawerOpen] = useState(false);
  const [sessionStartedAt] = useState(() => Date.now());
  const [sessionClock, setSessionClock] = useState(() => Date.now());
  const [isRecording, setIsRecording] = useState(false);
  const [canvasVisible, setCanvasVisible] = useState(true);
  const [surfaceSettings, setSurfaceSettings] = useState<UserSurfaceSettings>(
    () => readUserSurfaceSettings(),
  );
  // Phase 4: track whether a roundtable Billy synthesis has been shown
  const [billySynthesisText, setBillySynthesisText] = useState<string | null>(
    null,
  );
  const [recapResetToken, setRecapResetToken] = useState(0);
  const lastRoundtableCountRef = useRef(0);

  const endRef = useRef<HTMLDivElement | null>(null);
  const inactivityTimerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const voiceBaseDraftRef = useRef("");
  const voiceTranscriptRef = useRef("");
  const styleRef = useRef(false);

  const currentUserId = user?.id ?? "guest";
  const embodimentProfileCount = useMemo(
    () => getAllEmbodimentProfiles().length,
    [],
  );

  const selectedPersonas = useMemo(() => {
    const list = selectedPersonaSlugs
      .map((slug) => PERSONAS.find((p) => p.slug === slug))
      .filter((p): p is Persona => Boolean(p));
    return list.length > 0 ? list : [getRoomPersona("blackboard")];
  }, [selectedPersonaSlugs]);

  const selectedPersona = selectedPersonas[0] ?? getRoomPersona("blackboard");
  const availablePersonas = PERSONAS;
  const activePersonaHue = selectedPersona.atmosphereHue ?? "#32b8c6";
  const summaryHighlights = useMemo(
    () => summarizeMessages(messages),
    [messages],
  );
  const summaryCaptures = useMemo(
    () => buildSummaryBlueprint(messages),
    [messages],
  );
  const recapCaptures = useMemo(
    () =>
      summaryCaptures.map((capture) => ({
        id: capture.id,
        title: capture.title,
        content: capture.text,
        type: capture.type,
        surface: capture.metadata.surface,
        metadata: {
          context: capture.metadata.context ?? capture.metadata.meaning,
          createdAt: capture.createdAt,
          tags: capture.tags,
        },
      })),
    [summaryCaptures],
  );
  const recapConversationHistory = useMemo(
    () =>
      messages.map((message): RecapMessage => ({
        role: message.role === "user" ? "user" : "assistant",
        content: message.text,
      })),
    [messages],
  );
  const sessionElapsedLabel = useMemo(
    () => formatSessionDuration(Math.max(0, sessionClock - sessionStartedAt)),
    [sessionClock, sessionStartedAt],
  );
  const [isRecapPanelOpen, setIsRecapPanelOpen] = useState(false);
  const blueprint = useMemo(() => {
    if (summaryCaptures.length === 0) return null;
    return buildBlueprintFromCaptures(summaryCaptures, "Blackboard Summary", {
      summary: summaryHighlights.join(" • "),
      status: "ready",
      notes: summaryHighlights,
    });
  }, [summaryCaptures, summaryHighlights]);

  // Inject scoped styles
  useEffect(() => {
    if (styleRef.current) return;
    const tag = document.createElement("style");
    tag.id = "bbr-scoped-styles";
    tag.textContent = BBR_STYLES;
    document.head.appendChild(tag);
    styleRef.current = true;
    return () => {
      const el = document.getElementById("bbr-scoped-styles");
      if (el) el.remove();
      styleRef.current = false;
    };
  }, []);

  useEffect(() => {
    writeStoredMessages(messages);
  }, [messages]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--bbr-persona-hue",
      activePersonaHue,
    );
  }, [activePersonaHue]);

  useEffect(() => {
    return () => {
      document.documentElement.style.setProperty(
        "--bbr-persona-hue",
        "#32b8c6",
      );
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(
      () => setSessionClock(Date.now()),
      1000,
    );
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (summaryCaptures.length > 0) {
      setIsRecapPanelOpen(true);
    }
  }, [summaryCaptures.length]);

  useEffect(() => {
    if (endRef.current)
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sessionEnded, isTimedOut, billySynthesisText]);

  useEffect(() => {
    setRoomPersona("blackboard", selectedPersona.slug);
  }, [selectedPersona.slug]);

  useEffect(() => {
    const onSettingsChanged = (event: Event) => {
      const next =
        (event as CustomEvent<UserSurfaceSettings>).detail ??
        readUserSurfaceSettings();
      setSurfaceSettings(next);
      if (!next.voiceCapture) {
        recognitionRef.current?.stop?.();
      }
    };

    window.addEventListener(USER_SURFACE_SETTINGS_EVENT, onSettingsChanged);
    return () =>
      window.removeEventListener(
        USER_SURFACE_SETTINGS_EVENT,
        onSettingsChanged,
      );
  }, []);

  useEffect(() => {
    const resetTimer = () => {
      if (inactivityTimerRef.current)
        window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = window.setTimeout(
        () => setIsTimedOut(true),
        INACTIVITY_LIMIT_MS,
      );
    };
    resetTimer();
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("pointerdown", resetTimer);
    return () => {
      if (inactivityTimerRef.current)
        window.clearTimeout(inactivityTimerRef.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("pointerdown", resetTimer);
    };
  }, [messages, sessionEnded, isTimedOut]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const addChatMessages = (newMessages: ChatMessage[]) => {
    setMessages((current) => {
      if (current.length === 0) setCanvasVisible(false);
      return [...current, ...newMessages];
    });
  };

  const handleSend = async (
    text: string,
    source: "typed" | "voice" | "upload" = "typed",
    incomingHandoff?: { handoffId: string },
  ) => {
    const capturedText = text.trim();
    if (!capturedText || isSending) return;
    setAttachmentName(null);
    // Reset Billy synthesis on new send
    setBillySynthesisText(null);

    const orb = createCaptureOrb({
      text: capturedText,
      source,
      action: "save",
      context: "Blackboard Room",
      meaning: "Direct user capture",
    });
    const previousSavedCaptures = readSavedCaptures();
    let sourceCitation: ChatMessage["sourceCitation"];
    if (orb) {
      const routed = await routeBlackboardCaptureThroughPipeline({
        orb,
        action: "save",
        ownerUserId: currentUserId,
      });
      if (incomingHandoff) {
        try {
          const accepted = await acceptTranscriptoryHandoffInBlackboard({
            handoffId: incomingHandoff.handoffId,
            destinationCitationId: incomingHandoff.handoffId,
          });
          sourceCitation = {
            sourceRef: accepted.sourceRef,
            handoffId: accepted.handoffId,
            status: "accepted",
          };
        } catch (error) {
          throw new Error(
            error instanceof Error
              ? error.message
              : "Transcriptory source was retained locally, but durable acknowledgement failed.",
          );
        }
      } else if (source === "upload") {
        sourceCitation = {
          sourceRef: `blackboard-capture:${routed.canonicalCapture.captureId}`,
          status: "local_only",
        };
      }
      void enrichBlackboardCaptureWithResonance({
        capture: routed.orb,
        previousCaptures: previousSavedCaptures,
        userId: currentUserId,
      }).then((enriched) => {
        updateSavedCapture(enriched.id, () => enriched);
        const score = enriched.metadata.genEngine?.resonanceScore;
        if (typeof score === "number") {
          setMessages((current) =>
            current.map((message) =>
              message.captureId === enriched.id
                ? { ...message, captureResonanceScore: score }
                : message,
            ),
          );
        }
      });
    }

    const responders = isRoundtable ? selectedPersonas : [selectedPersona];
    const createdAt = new Date().toISOString();
    addChatMessages([
      {
        id: createId("message"),
        role: "user",
        text: capturedText,
        createdAt,
        captureId: orb?.id,
        sourceCitation,
        persistenceScope: "local_only",
      },
    ]);
    setSessionEnded(false);
    setIsTimedOut(false);
    setIsSending(true);

    try {
      const replies = await Promise.all(
        responders.map(async (persona) => {
          try {
            const response = await routeBlackboardResponder({
              message: capturedText,
              personaSlug: persona.slug,
              isRoundtable,
              userTier: tier,
            });

            const responseText =
              response.text?.trim() || roomFallbackResponse();
            // Phase 3: populate council metadata for roundtable messages
            const councilMetadata = isRoundtable
              ? buildCouncilMetadata(responseText, persona.name)
              : undefined;

            return {
              persona,
              text: responseText,
              responseSource: response.source,
              councilMetadata,
            };
          } catch {
            return {
              persona,
              text: roomFallbackResponse(),
              responseSource: "billy" as const,
              councilMetadata: undefined,
            };
          }
        }),
      );

      const newDiMessages: ChatMessage[] = replies.map(
        ({ persona, text, responseSource, councilMetadata }) => ({
          id: createId("message"),
          role: "di" as const,
          text,
          createdAt,
          personaSlug: persona.slug,
          responseSource,
          councilMetadata,
        }),
      );

      addChatMessages(newDiMessages);

      // Phase 4: generate Billy synthesis after roundtable exchange
      if (isRoundtable && newDiMessages.length > 1) {
        const synthesis = buildBillySynthesis(newDiMessages);
        if (synthesis) {
          window.setTimeout(() => setBillySynthesisText(synthesis), 320);
        }
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleInputSend = () => {
    const text = draft.trim();
    if (!text || isSending) return;
    void handleSend(text, "typed");
    setDraft("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  useEffect(() => {
    const raw = window.sessionStorage.getItem(
      TRANSCRIPTORY_BLACKBOARD_HANDOFF_KEY,
    );
    if (!raw || isSending) return;
    try {
      const payload = JSON.parse(raw) as {
        text?: string;
        handoffId?: string;
      };
      const text = payload.text?.trim();
      if (!text) return;
      void handleSend(
        text,
        "upload",
        payload.handoffId ? { handoffId: payload.handoffId } : undefined,
      )
        .then(() => {
          window.sessionStorage.removeItem(
            TRANSCRIPTORY_BLACKBOARD_HANDOFF_KEY,
          );
        })
        .catch((error) => {
          toast.error(
            error instanceof Error
              ? `${error.message} The incoming source remains available to retry.`
              : "Blackboard intake failed. The incoming source remains available to retry.",
          );
        });
      toast.success(
        payload.handoffId
          ? "Transcriptory source received; durable acknowledgement is being recorded."
          : "Local-only Transcriptory compatibility source received.",
      );
    } catch {
      window.sessionStorage.removeItem(TRANSCRIPTORY_BLACKBOARD_HANDOFF_KEY);
    }
  }, [isSending]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleInputSend();
    }
  };

  const resizeTextarea = (ta: HTMLTextAreaElement | null) => {
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 240) + "px";
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    resizeTextarea(e.target);
  };

  const handleUpload = async (file: File) => {
    const rawText = file.type.startsWith("text/")
      ? await file.text()
      : undefined;
    const textPreview =
      file.type.startsWith("text/") && !file.type.startsWith("text/html")
        ? rawText
        : undefined;
    const htmlPreview = file.type.startsWith("text/html") ? rawText : undefined;
    const imageDataUrl = file.type.startsWith("image/")
      ? await fileToDataUrl(file)
      : undefined;

    const fileRecord: UserFileRecord = createUserFileRecord({
      userId: currentUserId,
      file,
      roomOrigin: "blackboard",
      previewText: textPreview,
      previewHtml: htmlPreview,
      dataUrl: imageDataUrl,
      previewUrl: imageDataUrl,
    });

    const persisted = user?.id
      ? ((await uploadUserFileToServer({
          file: fileRecord,
          content:
            fileRecord.previewHtml ?? fileRecord.previewText ?? undefined,
          base64DataUrl:
            fileRecord.previewUrl ?? fileRecord.dataUrl ?? undefined,
        })) ?? fileRecord)
      : fileRecord;

    appendUserFile(persisted);
    setAttachmentName(file.name);
    if (textPreview || htmlPreview) {
      const nextDraft = [
        draft.trim(),
        `Attached ${file.name}:`,
        textPreview ?? htmlPreview,
      ]
        .filter(Boolean)
        .join("\n\n");
      setDraft(nextDraft);
      window.requestAnimationFrame(() => resizeTextarea(textareaRef.current));
    }
    toast.success(
      user?.id
        ? "Saved to File Explorer."
        : "File kept locally. Sign in to sync it.",
    );
  };

  const handleVoiceToggle = () => {
    if (!surfaceSettings.voiceCapture) {
      toast.info("Voice capture is turned off in Settings.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop?.();
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      toast.error("Voice capture is unavailable in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onstart = () => {
      voiceBaseDraftRef.current = draft.trim();
      voiceTranscriptRef.current = "";
      setIsRecording(true);
    };
    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };
    recognition.onerror = (event: any) => {
      setIsRecording(false);
      toast.error(
        event?.error
          ? `Voice capture stopped: ${event.error}`
          : "Voice capture stopped.",
      );
    };
    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript ?? "";
        if (result.isFinal) finalText += transcript;
        else interimText += transcript;
      }

      if (finalText.trim()) {
        voiceTranscriptRef.current = [
          voiceTranscriptRef.current,
          finalText.trim(),
        ]
          .filter(Boolean)
          .join(" ");
      }

      const nextDraft = [
        voiceBaseDraftRef.current,
        voiceTranscriptRef.current,
        interimText.trim(),
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      setDraft(nextDraft);
      window.requestAnimationFrame(() => resizeTextarea(textareaRef.current));
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const fileToDataUrl = async (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () =>
        reject(reader.error ?? new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });

  const handleEndSession = () => {
    recognitionRef.current?.stop?.();
    setSessionEnded(true);
    setIsTimedOut(false);
    setIsSending(false);
    toast.success(
      "Session ended. The transcript is still here until you clear it.",
    );
  };

  const handleClearSession = () => {
    recognitionRef.current?.stop?.();
    clearStoredMessages();
    try {
      window.sessionStorage.removeItem(RECAP_STORAGE_KEY);
    } catch {
      // best-effort only
    }
    setMessages([]);
    setDraft("");
    setAttachmentName(null);
    setSessionEnded(false);
    setIsTimedOut(false);
    setIsSending(false);
    setCanvasVisible(true);
    setBillySynthesisText(null);
    setRecapResetToken((current) => current + 1);
    toast.success("Blackboard session cleared.");
  };

  const handleBlueprintExport = () => {
    if (!blueprint) {
      toast.info("Gather a few turns before I package the blueprint.");
      return;
    }
    setIsBlueprintDrawerOpen(true);
  };

  const handleSendBlueprint = async () => {
    if (!blueprint) return;
    if (!user?.id) {
      appendBlueprint(blueprint);
      toast.info(
        "Blueprint retained locally. Sign in to create a durable Creation Corner offer.",
      );
      return;
    }
    try {
      const handoff = await offerBlackboardBlueprint({
        ownerId: user.id,
        blueprint,
        selectedEmbodiments: selectedPersonaSlugs,
      });
      appendBlueprint(blueprint);
      window.sessionStorage.setItem(
        "gestaltview.blackboard.creationHandoff.v1",
        JSON.stringify({
          handoffId: handoff.handoffId,
          blueprintId: blueprint.id,
        }),
      );
      setIsBlueprintDrawerOpen(false);
      toast.success(`Blueprint offer ${handoff.state}.`, {
        action: {
          label: "Open Creation Corner",
          onClick: () => setLocation("/creation-corner"),
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Durable Creation Corner offer failed. The blueprint remains here.",
      );
    }
  };

  const handleSendToScaffold = async () => {
    if (!blueprint) {
      toast.info("Gather a few turns before promoting to scaffold.");
      return;
    }
    if (!user?.id) {
      toast.info(
        "Sign in before explicitly offering this blueprint to External Scaffold.",
      );
      return;
    }
    try {
      await offerBlackboardBlueprintToScaffold({
        ownerId: user.id,
        blueprint,
        selectedEmbodiments: selectedPersonaSlugs,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "External Scaffold offer failed. Nothing was promoted.",
      );
      return;
    }
    appendBlueprint(blueprint);

    // Write orbs to the queue directly — this is the reliable path the Scaffold page reads from.
    for (const capture of summaryCaptures) {
      appendScaffoldQueue(capture);
    }

    // Fire the pipeline in the background for provenance tracking; errors don't block the user.
    void Promise.all(
      summaryCaptures.map((capture) =>
        routeBlackboardCaptureThroughPipeline({
          orb: capture,
          action: "send-to-external-scaffold",
          ownerUserId: currentUserId,
        }).catch(() => undefined),
      ),
    );

    toast.success("Session promoted to External Scaffold.", {
      action: {
        label: "Open Scaffold",
        onClick: () => setLocation("/external-scaffold"),
      },
    });
  };

  const handleProposeProfileMemory = () => {
    if (!blueprint) return;
    const proposal = buildBlackboardProfileProposal({
      blueprintId: blueprint.id,
      sourceCaptureIds: blueprint.sourceOrbIds,
      selectedEmbodiments: selectedPersonaSlugs,
      proposedMemory: blueprint.summary,
    });
    appendBlackboardProfileProposal(proposal);
    toast.success(
      "Profile memory proposal saved for review. No profile state was changed.",
    );
  };

  const handleRecapArtifactReady = (artifact: RecapArtifact) => {
    toast.success(`${artifact.title} is ready. Choose where to send it.`);
  };

  const handleCopyBlueprint = async () => {
    if (!blueprint) return;
    try {
      await navigator.clipboard.writeText(blueprint.outputs.markdown);
      toast.success("Blueprint markdown copied.");
    } catch {
      toast.error("I couldn't reach the clipboard right now.");
    }
  };

  const handleDownloadBlueprint = () => {
    if (!blueprint) return;
    const blob = new Blob([blueprint.outputs.markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${blueprint.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "blackboard-summary"}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Blueprint markdown downloaded.");
  };

  // ─── Derived ────────────────────────────────────────────────────────────────

  const savedCount = readSavedCaptures().length;
  const innerWorldCount = readInnerWorldCaptures().length;
  const latestCapture = summaryCaptures[0] ?? null;
  const sessionIsEnded = sessionEnded || isTimedOut;
  const roomStatusLabel = isSending
    ? "Billy is thinking"
    : sessionEnded
      ? "Session wrapped"
      : isTimedOut
        ? "Timed out"
        : isRoundtable
          ? "Roundtable"
          : "Live session";

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    // Phase 1 fix: h-dvh replaces min-h-screen so the page never overflows the viewport
    <main className="relative h-dvh overflow-hidden bg-[#03040a] text-white">
      <BabylonAtmosphere mode="blackboard" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(18,214,255,0.06),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(245,158,11,0.06),transparent_24%),linear-gradient(180deg,rgba(3,4,10,0.12),rgba(3,4,10,0.72))]" />

      {/* ── Full-height flex column — chat takes remaining space ── */}
      <div className="relative z-10 mx-auto flex h-dvh w-full max-w-4xl flex-col overflow-hidden px-4 pb-4 pt-20 sm:px-6 sm:pt-24">
        {/* ── Header bar — fixed height ── */}
        <header className="flex flex-wrap items-start justify-between gap-3 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/">
              <a className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm text-white/72 transition-colors hover:text-white">
                Home
              </a>
            </Link>
            <RoomStateBadge slug="blackboard-room" />
            <Link href="/tribunal">
              <a className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-white transition-colors hover:bg-cyan-300/14">
                <ExternalLink className="size-4" />
                Tribunal
              </a>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
              <Clock3 className="size-4 text-cyan-200/80" />
              Session {sessionElapsedLabel}
            </span>
            <button
              type="button"
              onClick={handleEndSession}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-sm text-white transition-colors hover:bg-rose-300/14"
            >
              End session
            </button>
            <button
              type="button"
              onClick={handleClearSession}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72 transition-colors hover:border-rose-300/20 hover:bg-rose-300/10 hover:text-white"
            >
              <Trash2 className="size-4 text-rose-200/80" />
              Clear
            </button>
          </div>
        </header>

        {/* ── Hero — compact, fixed ── */}
        <div className="mt-5 text-center flex-shrink-0">
          <h1 className="bbr-hero-title">Blackboard Room</h1>
          <p className="bbr-hero-eyebrow">Digital Intelligence Embodiments</p>
        </div>

        {/* ── Babylon Hero Canvas — collapses after first message ── */}
        <div
          className="flex-shrink-0 overflow-hidden transition-all duration-500 ease-in-out"
          style={{
            marginTop: canvasVisible ? "20px" : "0px",
            maxHeight: canvasVisible ? "160px" : "0px",
            opacity: canvasVisible ? 1 : 0,
          }}
        >
          <BabylonHeroCanvas hue={activePersonaHue} />
        </div>

        {/* ── Tribunal path card ── */}
        <section className="mt-5 flex-shrink-0 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">
                Embodiment Tribunal
              </p>
              <p className="mt-2 text-sm leading-6 text-white/62">
                {isRoundtable && selectedPersonas.length > 1
                  ? `${selectedPersonas.length} voices active.`
                  : "Single voice active."}{" "}
                Open the dedicated Tribunal page for the full AgentCouncil room.
              </p>
            </div>
            <Link href="/tribunal">
              <a className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-white transition-colors hover:bg-cyan-300/14">
                <ExternalLink className="size-4" />
                Open Tribunal
              </a>
            </Link>
          </div>
          <p className="mt-3 text-xs leading-5 text-white/42">
            /tribunal opens{" "}
            <span className="text-white/60">AgentCouncilPage.tsx</span> from
            Blackboard Room.
          </p>
        </section>

        {/* ── Chat feed — THIS is the flex-grow element ── */}
        <div
          className="bbr-scroll mt-5 flex flex-col gap-5"
          style={{ padding: "4px 2px" }}
        >
          {messages.length === 0 ? (
            <div
              className="flex min-h-[12rem] items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.025] text-center"
              style={{ padding: "32px 24px" }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "'Cabin Sketch', cursive",
                    fontSize: "1rem",
                    color: "rgba(50,184,198,0.55)",
                    letterSpacing: "0.04em",
                  }}
                >
                  The room is open.
                </p>
                <p
                  style={{
                    fontFamily: "'Geist','Inter',system-ui,sans-serif",
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.28)",
                    marginTop: 6,
                  }}
                >
                  Start with a thought. Billy keeps the thread.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const persona =
                message.role === "di"
                  ? (PERSONAS.find((p) => p.slug === message.personaSlug) ??
                    selectedPersona)
                  : null;
              // Phase 2: per-DI hue pulled from persona.auroraColor CSS var
              const accentColor = persona
                ? `var(${persona.auroraColor})`
                : "var(--gv-aurora-cyan)";
              const rawHex = persona?.atmosphereHue ?? activePersonaHue;

              return (
                <div
                  key={message.id}
                  className={`bbr-message-row bbr-msg-enter flex items-end gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "di" ? (
                    // Phase 2: avatar orb uses per-DI accent color
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90"
                      style={{
                        borderColor: accentColor,
                        backgroundColor: "rgba(255,255,255,0.04)",
                        boxShadow: `0 0 10px ${rawHex}44`,
                      }}
                    >
                      {persona?.name.slice(0, 1) ?? "D"}
                    </div>
                  ) : null}

                  <div
                    className="bbr-message-stack"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        message.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      className={
                        message.role === "di"
                          ? "bbr-label-di"
                          : "bbr-label-user"
                      }
                    >
                      {/* Phase 2: inline orb dot in label for DI */}
                      {message.role === "di" && (
                        <span
                          className="bbr-di-orb"
                          style={{
                            backgroundColor: accentColor,
                            color: accentColor,
                          }}
                        />
                      )}
                      <span
                        style={
                          message.role === "di"
                            ? { color: accentColor }
                            : undefined
                        }
                      >
                        {message.role === "user"
                          ? "You"
                          : (persona?.name ?? selectedPersona.name)}
                      </span>
                      <span
                        style={{
                          marginLeft: 8,
                          opacity: 0.4,
                          fontFamily: "'Geist','Inter',system-ui,sans-serif",
                          fontSize: "0.66rem",
                        }}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Phase 2: bubble border uses per-DI hue via inline CSS var */}
                    <div
                      className={[
                        message.role === "di"
                          ? "bbr-bubble-di"
                          : "bbr-bubble-user",
                        message.responseSource === "di-runtime"
                          ? "di-response"
                          : "",
                        message.captureResonanceScore &&
                        message.captureResonanceScore > 0.7
                          ? "resonance-response"
                          : "",
                      ].join(" ")}
                      style={
                        message.role === "di"
                          ? ({
                              "--bbr-bubble-hue": rawHex,
                            } as React.CSSProperties)
                          : undefined
                      }
                    >
                      <p
                        className={
                          message.role === "di"
                            ? "bbr-text-di"
                            : "bbr-text-user"
                        }
                      >
                        {message.text}
                      </p>
                    </div>
                    {message.sourceCitation ? (
                      <div className="mt-2 max-w-xl rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-2 text-xs leading-5 text-cyan-50/72">
                        <span className="font-mono uppercase tracking-[0.14em]">
                          {message.sourceCitation.status === "accepted"
                            ? "Durable cited source"
                            : message.sourceCitation.status === "failed"
                              ? "Acknowledgement failed"
                              : "Local-only source"}
                        </span>
                        <span className="mt-1 block break-all text-white/48">
                          {message.sourceCitation.sourceRef}
                        </span>
                      </div>
                    ) : message.role === "user" &&
                      message.persistenceScope === "local_only" ? (
                      <div className="mt-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                        Local Blackboard session · {message.id}
                      </div>
                    ) : null}

                    {/* Phase 3: council metadata card — only in roundtable mode */}
                    {message.role === "di" && message.councilMetadata ? (
                      <div
                        className="bbr-council-card"
                        style={{ borderColor: `${rawHex}22` }}
                      >
                        <div className="bbr-council-label">
                          Council position
                        </div>
                        <p className="bbr-council-stance">
                          {message.councilMetadata.stance}
                        </p>
                        {message.councilMetadata.concerns.map(
                          (concern, idx) => (
                            <p key={idx} className="bbr-council-concern">
                              {concern}
                            </p>
                          ),
                        )}
                        {message.councilMetadata.recommendedNextStep && (
                          <p className="bbr-council-nextstep">
                            → {message.councilMetadata.recommendedNextStep}
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {message.role === "user" ? (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-semibold uppercase tracking-[0.2em] text-white/72">
                      U
                    </div>
                  ) : null}
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {isSending ? (
            <div className="bbr-message-row flex items-end gap-3 justify-start bbr-msg-enter">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90"
                style={{
                  borderColor: activePersonaHue,
                  backgroundColor: "rgba(255,255,255,0.04)",
                }}
              >
                {selectedPersona.name.slice(0, 1)}
              </div>
              <ThinkingAnimation
                diName={selectedPersona.name}
                messages={BLACKBOARD_THINKING_MESSAGES}
                interval={3600}
              />
            </div>
          ) : null}

          {/* Phase 4: Billy synthesis block — rendered after roundtable exchange */}
          {billySynthesisText && !isSending ? (
            <div className="bbr-message-row flex justify-start bbr-msg-enter">
              <div className="bbr-billy-synthesis">
                <div className="bbr-billy-synthesis-label">
                  Billy · synthesis
                </div>
                <p className="bbr-billy-synthesis-text">{billySynthesisText}</p>
              </div>
            </div>
          ) : null}

          <div ref={endRef} />
        </div>

        {/* ── Session end / timeout summary — only visible when session ends ── */}
        {sessionIsEnded && summaryCaptures.length > 0 ? (
          <section className="mt-4 flex-shrink-0 max-h-[32dvh] overflow-y-auto rounded-[2rem] border border-cyan-300/12 bg-cyan-300/[0.05] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Here's what we covered. A few things stood out.
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-white/72">
                  {summaryHighlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="rounded-[1rem] border border-white/8 bg-black/20 px-3 py-2"
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={handleBlueprintExport}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-300/14"
              >
                Review blueprint
                <SquareLibrary className="h-4 w-4" />
              </button>
            </div>
          </section>
        ) : null}

        {/* ── Promote bar — always visible once there are messages ── */}
        {messages.length > 0 ? (
          <div className="bbr-promote-bar mt-4">
            <span className="bbr-promote-label">Promote to →</span>
            <button
              type="button"
              className="bbr-promote-btn"
              onClick={handleBlueprintExport}
              disabled={!blueprint}
              title="Send session blueprint to Creation Corner"
            >
              <SquareLibrary size={13} />
              Creation Corner
            </button>
            <button
              type="button"
              className="bbr-promote-btn scaffold"
              onClick={handleSendToScaffold}
              disabled={!blueprint}
              title="Promote session to External Scaffold"
            >
              <ExternalLink size={13} />
              External Scaffold
            </button>
          </div>
        ) : null}

        {summaryCaptures.length > 0 ? (
          <section className="mt-4 flex-shrink-0 rounded-[2rem] border border-violet-300/12 bg-violet-300/[0.05] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-violet-200/70">
                  Session recap
                </p>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  Billy can turn the captured thread into a living recap.
                  Nothing moves rooms until you choose a destination.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRecapPanelOpen((current) => !current)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-300/14"
              >
                {isRecapPanelOpen ? "Collapse recap" : "Expand recap"}
              </button>
            </div>

            {isRecapPanelOpen ? (
              <div className="mt-4">
                <SessionRecapGenerator
                  key={recapResetToken}
                  captures={recapCaptures}
                  conversationHistory={recapConversationHistory}
                  sessionLabel="Blackboard Room"
                  onArtifactReady={handleRecapArtifactReady}
                />
              </div>
            ) : null}
          </section>
        ) : null}

        {/* ── Glass Input Card — always at bottom, never compresses ── */}
        <div className="bbr-glass-input mt-4">
          <div style={{ padding: "14px 16px 10px" }}>
            <textarea
              ref={textareaRef}
              className="bbr-textarea"
              placeholder={`Speak to ${selectedPersona.name}…`}
              value={draft}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              rows={1}
            />
          </div>

          <div className="bbr-glass-toolbar">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flex: 1,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'Geist','Inter',system-ui,sans-serif",
                  fontSize: "0.68rem",
                  color: "rgba(50,184,198,0.4)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                DI Embodiment
              </span>
              <select
                className="bbr-di-select"
                value={selectedPersona.slug}
                onChange={(e) => setSelectedPersonaSlugs([e.target.value])}
              >
                {availablePersonas.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={(event) => {
                  const files = Array.from(event.currentTarget.files ?? []);
                  void Promise.all(files.map(handleUpload));
                  event.currentTarget.value = "";
                }}
              />
              <button
                type="button"
                className="bbr-icon-btn"
                title="Attach file"
                aria-label="Attach"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={15} />
              </button>
              <button
                type="button"
                className={`bbr-icon-btn${isRecording ? " recording" : ""}`}
                onClick={handleVoiceToggle}
                title={
                  !surfaceSettings.voiceCapture
                    ? "Voice capture is off in Settings"
                    : isRecording
                      ? "Stop recording"
                      : "Voice input"
                }
                aria-label="Voice"
              >
                <Mic size={15} />
              </button>
              <button
                className="bbr-send-btn"
                onClick={handleInputSend}
                disabled={!draft.trim() || isSending}
                title="Send"
                aria-label="Send"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Companion Chat + Room signal — only after session ends ── */}
        {sessionIsEnded ? (
          <>
            <div className="mt-6">
              <BlackboardCompanionChat
                selectedSurfaceLabel="Blackboard Room"
                selectedSurfaceDescription="Session stays visible while you think."
                selectedTypeLabel="Session"
                selectedCapture={latestCapture}
                sessionCaptureCount={summaryCaptures.length}
                savedCount={savedCount}
                innerWorldCount={innerWorldCount}
                latestActionLabel={
                  attachmentName
                    ? `Attachment ready: ${attachmentName}`
                    : messages.length > 0
                      ? "Session held"
                      : null
                }
                latestOrbTitle={latestCapture?.title ?? null}
                blueprintReady={Boolean(blueprint)}
                blueprintLabel={
                  blueprint ? blueprint.title : "No blueprint yet"
                }
                onPromoteBlueprint={handleBlueprintExport}
                onSendToCreationCorner={handleSendBlueprint}
              />
            </div>

            <section className="mt-4 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md flex-shrink-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">
                Room signal
              </p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-white/68">
                <p>Session state: {roomStatusLabel}</p>
                <p>Current voice: {selectedPersona.voiceDescription}</p>
                <p>Embodiment registry: {embodimentProfileCount} profiles.</p>
                <p>
                  Keep the thread visible until you decide what becomes
                  structure.
                </p>
              </div>
            </section>
          </>
        ) : null}
      </div>

      {/* ── Blueprint Drawer ── */}
      <Drawer
        open={isBlueprintDrawerOpen}
        onOpenChange={setIsBlueprintDrawerOpen}
        direction="bottom"
      >
        <DrawerContent className="border-t border-white/10 bg-[#05070b] text-white">
          <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-white/12" />
          <DrawerHeader className="border-b border-white/8 px-5 pb-5 pt-5 sm:px-6">
            <DrawerTitle className="text-2xl font-semibold text-white">
              Blueprint preview
            </DrawerTitle>
            <DrawerDescription className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
              Billy has gathered the session into a draft blueprint. Review the
              shape, copy the markdown, save a file, or send it onward to
              Creation Corner or External Scaffold.
            </DrawerDescription>
          </DrawerHeader>

          {blueprint ? (
            <div className="grid gap-5 overflow-y-auto px-5 py-5 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-4">
                <section className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">
                    Blueprint
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {blueprint.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/66">
                    {blueprint.summary}
                  </p>
                </section>
                <section className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">
                    Session notes
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-white/72">
                    {summaryHighlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="rounded-[1rem] border border-white/8 bg-black/20 px-3 py-2"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">
                    Source captures
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-white/72">
                    {summaryCaptures.map((capture) => (
                      <li
                        key={capture.id}
                        className="rounded-[1rem] border border-white/8 bg-black/20 px-3 py-2"
                      >
                        <span className="block text-white/84">
                          {capture.title}
                        </span>
                        <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-white/38">
                          {capture.source}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
              <section className="rounded-[1.4rem] border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">
                      Markdown
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/56">
                      This is the export payload Creation Corner will receive.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/50">
                    {blueprint.outputs.markdown.length} chars
                  </span>
                </div>
                <pre className="mt-4 max-h-[42rem] overflow-auto rounded-[1.2rem] border border-white/10 bg-black/35 p-4 text-xs leading-6 text-white/72">
                  {blueprint.outputs.markdown}
                </pre>
              </section>
            </div>
          ) : null}

          <DrawerFooter className="border-t border-white/8 px-5 py-5 sm:px-6">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCopyBlueprint}
                disabled={!blueprint}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Copy className="size-4" /> Copy markdown
              </button>
              <button
                type="button"
                onClick={handleDownloadBlueprint}
                disabled={!blueprint}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="size-4" /> Save as file
              </button>
              <button
                type="button"
                onClick={handleSendBlueprint}
                disabled={!blueprint}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-300/14 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SquareLibrary className="size-4" /> Send to Creation Corner
              </button>
              <button
                type="button"
                onClick={handleSendToScaffold}
                disabled={!blueprint}
                className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-300/14 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ExternalLink className="size-4" /> Send to External Scaffold
              </button>
              <button
                type="button"
                onClick={handleProposeProfileMemory}
                disabled={!blueprint}
                className="inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-300/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-300/14 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Propose profile memory
              </button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </main>
  );
}
