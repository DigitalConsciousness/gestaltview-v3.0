import { useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Mic, Paperclip, Send, Sparkles, UsersRound } from "lucide-react";

import { buildDirectEmbodimentChatPrompt } from "@shared/embodiment/chat";
import type { EmbodimentProfile, RoomSlug } from "@shared/embodiment";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import {
  getEmbodimentChatMode,
  getEmbodimentGreeting,
  getEmbodimentHeartbeat,
  getHeartbeatClassNames,
  getEmbodimentOrbPulseStyle,
} from "@/lib/embodimentHeartbeat";
import { getProfileBySlug } from "@/lib/embodimentRuntime";
import { EmbodimentOrb } from "./EmbodimentOrb";

type ChatMessage = {
  role: "system" | "user" | "profile";
  content: string;
};

export interface EmbodimentChatPlaneProps {
  profileSlug: string;
  roomSlug?: RoomSlug;
  mode?: "direct" | "tribunal" | "billy-handoff";
  initialPrompt?: string;
  onReturnToBilly?: () => void;
  onInviteToCouncil?: () => void;
}

function buildProfileReply(profile: EmbodimentProfile, prompt: string, mode: string): string {
  const heartbeat = getEmbodimentHeartbeat(profile);
  const rhythm = heartbeat.chatSignature.responseRhythm;
  const hooks = heartbeat.characterStudy.memoryHooks.slice(0, 2).join(", ");
  const firstQuestion = heartbeat.characterStudy.defaultQuestions[0] ?? "What matters here?";

  switch (profile.slug) {
    case "billy":
      return `Billy holds the thread: ${prompt}. The posture is ${rhythm}, with continuity and provenance kept visible. ${firstQuestion} ${hooks ? `Anchored by ${hooks}.` : ""}`;
    case "the-weaver":
      return `The Weaver reads ${prompt} as a pattern in motion. The response stays ${rhythm}, tracking joins, loops, and load-bearing connections. ${firstQuestion}`;
    case "the-guardian":
      return `The Guardian treats ${prompt} as a boundary question first. The answer is ${rhythm}, with consent, dignity, and risk made explicit. ${firstQuestion}`;
    case "the-architect":
      return `The Architect turns ${prompt} into a sequence. The lane is ${rhythm}, and the next dependency is named before the room moves. ${firstQuestion}`;
    case "gate-keeper":
      return `Gate Keeper checks whether ${prompt} can cross the threshold safely. The answer is ${rhythm}, with package risk and handoff clarity first. ${firstQuestion}`;
    case "repo-scribe":
      return `Repo Scribe treats ${prompt} like a traceable change. The response is ${rhythm}, with filenames, provenance, and source-of-truth discipline kept intact. ${firstQuestion}`;
    case "vibe-check":
      return `Vibe Check listens to ${prompt} as a resonance test. The reply stays ${rhythm}, naming whether the room feels aligned or strained. ${firstQuestion}`;
    default:
      return `${profile.publicName} responds to ${prompt} in ${mode} mode, holding to ${rhythm} rhythm and ${heartbeat.chatSignature.greetingStyle}.`;
  }
}

export function EmbodimentChatPlane({
  profileSlug,
  roomSlug,
  mode = "direct",
  initialPrompt,
  onReturnToBilly,
  onInviteToCouncil,
}: EmbodimentChatPlaneProps) {
  const profile = useMemo(() => getProfileBySlug(profileSlug), [profileSlug]);
  const fallbackProfile = useMemo(() => getProfileBySlug("billy")!, []);
  const activeProfile = profile ?? fallbackProfile;
  const heartbeat = useMemo(() => getEmbodimentHeartbeat(activeProfile), [activeProfile]);
  const styles = useMemo(() => getHeartbeatClassNames(activeProfile), [activeProfile]);
  const pulseStyle = useMemo(() => getEmbodimentOrbPulseStyle(activeProfile), [activeProfile]);
  const roomContext = roomSlug ? `Room: ${roomSlug}` : "Room: embodiment-studio";
  const promptPreview = useMemo(
    () =>
      buildDirectEmbodimentChatPrompt(activeProfile.slug, {
        roomSlug,
        conversationMode: mode === "tribunal" ? "tribunal" : "direct",
      }),
    [activeProfile.slug, mode, roomSlug]
  );

  const [draft, setDraft] = useState(initialPrompt ?? "");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { role: "system", content: getEmbodimentGreeting(activeProfile) },
    {
      role: "system",
      content: `Heartbeat mode: ${getEmbodimentChatMode(activeProfile)} · ${roomContext}`,
    },
  ]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextPrompt = draft.trim();
    if (!nextPrompt) {
      return;
    }

    const reply = buildProfileReply(activeProfile, nextPrompt, mode);

    setMessages((current) => [
      ...current,
      { role: "user", content: nextPrompt },
      { role: "profile", content: reply },
    ]);
    setDraft("");
  }

  return (
    <GlassCard
      glow="cyan"
      intensity="high"
      hover={false}
      className={cn(
        "relative overflow-hidden border-white/10 p-0",
        styles.shell
      )}
    >
      <div
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-0 opacity-100", styles.background)}
        style={{
          backgroundImage: heartbeat.visualSignature.backgroundGradient,
          backgroundColor: heartbeat.visualSignature.fogColor,
        }}
      />

      <div className="relative grid gap-6 p-5 md:p-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/48">
                {mode === "tribunal" ? "Tribunal lane" : "Direct profile chat"}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                {activeProfile.publicName}
              </h2>
              <p className="text-sm uppercase tracking-[0.24em] text-white/36">
                {activeProfile.immutableCore.archetype}
              </p>
            </div>

            <EmbodimentOrb
              size={88}
              color={heartbeat.visualSignature.primaryColor}
              pulseStyle={pulseStyle}
              label={`${activeProfile.publicName} heartbeat`}
              className={styles.orb}
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/22 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/34">
              Why this profile is here
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/74">
              {activeProfile.originContext}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/22 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/34">
              Boundary note
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/72">
              {activeProfile.uiPresence?.boundaryNote ?? "Private interior remains protected."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {onReturnToBilly ? (
              <button
                type="button"
                onClick={onReturnToBilly}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white/76 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Billy
              </button>
            ) : (
              <Link href="/billy">
                <a className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white/76 transition-colors hover:bg-white/[0.08] hover:text-white">
                  <ArrowLeft className="h-4 w-4" />
                  Return to Billy
                </a>
              </Link>
            )}
            {onInviteToCouncil ? (
              <button
                type="button"
                onClick={onInviteToCouncil}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#7FE9FF]/22 bg-[#7FE9FF]/10 px-4 py-3 text-sm text-white/82 transition-colors hover:bg-[#7FE9FF]/16 hover:text-white"
              >
                <UsersRound className="h-4 w-4" />
                Invite to tribunal
              </button>
            ) : (
              <Link href="/tribunal">
                <a className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#7FE9FF]/22 bg-[#7FE9FF]/10 px-4 py-3 text-sm text-white/82 transition-colors hover:bg-[#7FE9FF]/16 hover:text-white">
                  <UsersRound className="h-4 w-4" />
                  Invite to tribunal
                </a>
              </Link>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/22 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#7FE9FF]" />
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/34">
                Heartbeat contract
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/72">
              {heartbeat.characterStudy.narrativeArc}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-white/46">
              {heartbeat.characterStudy.memoryHooks.slice(0, 3).join(" · ")}
            </p>
          </div>
        </div>

        <div className="flex min-h-[560px] flex-col rounded-[28px] border border-white/10 bg-black/20 p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/34">
                Chat frame
              </p>
              <p className="mt-1 text-sm text-white/58">{heartbeat.chatSignature.greetingStyle}</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/48">
              {getEmbodimentChatMode(activeProfile)}
            </div>
          </div>

          <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <motion.div
                key={`${message.role}-${index}-${message.content.slice(0, 16)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className={cn(
                  "max-w-[92%] rounded-[24px] border px-4 py-3 text-sm leading-relaxed",
                  styles.messageFrame,
                  message.role === "user"
                    ? "ml-auto border-white/12 bg-white/[0.05] text-white/88"
                    : "mr-auto text-white/78"
                )}
              >
                <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-white/36">
                  {message.role === "user" ? "User" : activeProfile.publicName}
                </p>
                <p>{message.content}</p>
              </motion.div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-white/10 pt-4">
            <label className="block">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/34">
                Speak to {activeProfile.publicName}
              </span>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Ask ${activeProfile.publicName} something direct...`}
                className="min-h-[108px] w-full resize-none rounded-3xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#7FE9FF]/30 focus:bg-black/40"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/54"
                >
                  <Mic className="h-3.5 w-3.5" />
                  Voice input placeholder
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/54"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  Upload placeholder
                </button>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-[#7FE9FF]/22 bg-[#7FE9FF]/12 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#7FE9FF]/18"
              >
                <Send className="h-3.5 w-3.5" />
                Send
              </button>
            </div>
          </form>

          <details className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <summary className="cursor-pointer list-none text-[10px] uppercase tracking-[0.24em] text-white/40">
              Runtime prompt preview
            </summary>
            <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed text-white/56">
              {promptPreview}
            </pre>
          </details>
        </div>
      </div>
    </GlassCard>
  );
}

export default EmbodimentChatPlane;
