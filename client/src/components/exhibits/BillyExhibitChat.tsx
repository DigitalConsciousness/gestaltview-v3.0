// © 2026 Keith Soyka — GestaltView
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import EmbodimentSelector from "@/components/EmbodimentSelector";
import { useIsMobile } from "@/hooks/useMobile";
import {
  clearActiveExhibit,
  ExhibitContext,
  setActiveExhibit,
} from "@/lib/BillyEngine";
import { callBillyApi } from "@/lib/billyApi";
import type { TrainerEmbodimentSlug } from "@shared/agent-trainer/embodiment";

interface ExhibitMessage {
  role: "user" | "assistant";
  content: string;
}

interface BillyExhibitChatProps {
  context: ExhibitContext;
  exhibitSlug?: string;
  scopePrompt?: string;
  colorHex: string;
  neverLookAway?: boolean;
  plkEnabled?: boolean;
  bridgeContext?: string;
  bridgePayload?: Record<string, unknown>;
  fixed?: boolean;
}

const NEVER_LOOK_AWAY_RESOURCES: string[] =[
  "US & Canada: Call or text 988 for immediate crisis support.",
  "If there is immediate danger, call emergency services now.",
  "Reach out to a trusted person and share where you are right now.",
];

const OFFLINE_FALLBACK =
  "I'm here with you. Even if live synthesis is temporarily unavailable, we can still ground this moment together. Tell me what you need first: stabilization, reflection, or next-step structure.";

const seedAssistantMessage = (context: ExhibitContext): ExhibitMessage => ({
  role: "assistant",
  content: `Billy steward channel active for ${context.exhibitId}. I will stay inside this exhibit lens, keep it private by default, and preserve your language with care until you decide otherwise.`,
});

const buildPrompt = (
  input: string,
  plkEnabled?: boolean,
  bridgeContext?: string,
  bridgePayload?: Record<string, unknown>
): string => {
  const parts: string[] =[];

  if (plkEnabled) {
    parts.push("[PLK ACTIVE: Preserve the user's exact words. Do not paraphrase their voice.]");
  }
  if (bridgeContext) {
    parts.push(`[LIVE_EXHIBIT_CONTEXT]\n${bridgeContext}`);
  }
  if (bridgePayload) {
    parts.push(`[LIVE BRIDGE STATE]\n${JSON.stringify(bridgePayload)}`);
  }

  const prefix = parts.length > 0 ? `${parts.join("\n\n")}\n\n` : "";
  return `${prefix}User message: ${input}`;
};

const streamText = async (
  text: string,
  onChunk: (next: string) => void,
  delayMs = 14
): Promise<void> => {
  let current = "";
  for (const char of text) {
    current += char;
    onChunk(current);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
};

const BillyExhibitChat = ({
  context,
  colorHex,
  neverLookAway,
  plkEnabled,
  bridgeContext,
  bridgePayload,
}: BillyExhibitChatProps) => {
  const [messages, setMessages] = useState<ExhibitMessage[]>([seedAssistantMessage(context)]);
  const [input, setInput] = useState<string>("");
  const[isLoading, setIsLoading] = useState<boolean>(false);
  const [embodimentProfileSlug, setEmbodimentProfileSlug] =
    useState<TrainerEmbodimentSlug>("billy");
  const isMobile = useIsMobile();

  const[isExpanded, setIsExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const persisted = window.localStorage.getItem(`gv-exhibit-chat-${context.exhibitId}-expanded`);
    return persisted !== "false";
  });

  const transcriptRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef<number>(0);

  // Reset chat seed when exhibit ID changes
  useEffect(() => {
    setMessages([seedAssistantMessage(context)]);
  },[context.exhibitId]);

  // Bind this chat to the Global Engine context
  useEffect(() => {
    setActiveExhibit({
      ...context,
      plkEnabled,
      neverLookAway,
    });

    return () => {
      clearActiveExhibit();
    };
  },[context, plkEnabled, neverLookAway]);

  // Handle scroll retention when toggling panel
  useEffect(() => {
    if (!isExpanded && transcriptRef.current) {
      lastScrollTopRef.current = transcriptRef.current.scrollTop;
      return;
    }

    if (isExpanded && transcriptRef.current) {
      transcriptRef.current.scrollTop = lastScrollTopRef.current;
    }
  }, [isExpanded]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isExpanded && transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  },[messages, isLoading, isExpanded]);

  const inputPlaceholder = useMemo(() => {
    if (plkEnabled) {
      return "Drop the thought exactly as it arrived... PLK capture is active.";
    }
    return "Message Billy inside this platform scope...";
  }, [plkEnabled]);

  const toggleExpanded = (): void => {
    setIsExpanded((prev) => {
      const next = !prev;
      window.localStorage.setItem(`gv-exhibit-chat-${context.exhibitId}-expanded`, String(next));
      return next;
    });
  };

  const handleSendMessage = async (event?: FormEvent<HTMLFormElement>): Promise<void> => {
    if (event) event.preventDefault();
    
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ExhibitMessage = { role: "user", content: trimmed };
    const assistantMessage: ExhibitMessage = { role: "assistant", content: "" };

    setInput("");
    setIsLoading(true);
    setMessages((prev) =>[...prev, userMessage, assistantMessage]);

    try {
      // Build Augmented Input mapping
      const augmentedInput = buildPrompt(trimmed, plkEnabled, bridgeContext, bridgePayload);

      const response = await callBillyApi(
        augmentedInput,
        context.exhibitId,
        "synthesis",
        context.domain,
        embodimentProfileSlug
      );
      const resolved = response.text || OFFLINE_FALLBACK;

      await streamText(resolved, (nextText) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
            updated[lastIndex] = { ...updated[lastIndex], content: nextText };
          }
          return updated;
        });
      });
    } catch (error) {
      console.error("Chat Error:", error);
      await streamText(OFFLINE_FALLBACK, (nextText) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
            updated[lastIndex] = { ...updated[lastIndex], content: nextText };
          }
          return updated;
        });
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleExpanded}
        className="fixed bottom-4 right-4 rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] backdrop-blur transition-all"
        style={{
          borderColor: `${colorHex}90`,
          color: colorHex,
          background: "rgba(5,10,14,0.92)",
          zIndex: "var(--z-exhibit-overlay, 80)",
        }}
      >
        {isExpanded ? "Hide Billy" : "Open Billy"}
      </button>

      {isExpanded && (
        <section
          className={`fixed right-4 bottom-20 z-[80] flex flex-col rounded-2xl border p-4 shadow-2xl transition-all sm:p-5 ${
            isMobile ? "left-4" : "w-[min(420px,calc(100vw-2rem))]"
          }`}
          style={{
            borderColor: `${colorHex}40`,
            background: "rgba(5,10,14,0.94)",
            backdropFilter: "blur(8px)",
          }}
        >
          {neverLookAway && (
            <div
              className="mb-4 shrink-0 rounded-xl border px-4 py-3"
              style={{ borderColor: "rgba(248,113,113,0.45)", background: "rgba(248,113,113,0.08)" }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#F87171]">Never Look Away</p>
              <ul className="mt-2 space-y-1 text-xs text-white/80">
                {NEVER_LOOK_AWAY_RESOURCES.map((resource) => (
                  <li key={resource}>• {resource}</li>
                ))}
              </ul>
            </div>
          )}

          <div
            className="mb-4 rounded-xl border px-4 py-3"
            style={{ borderColor: `${colorHex}30`, background: "rgba(255,255,255,0.02)" }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: colorHex }}>
              Billy Exhibit Channel
            </p>
            <p className="mt-1 text-xs text-white/65">
              Surface: {context.exhibitId} · Domain: {context.domain}
            </p>
            <div className="mt-3">
              <EmbodimentSelector
                value={embodimentProfileSlug}
                onValueChange={setEmbodimentProfileSlug}
                label="Embodiment Standard"
                triggerClassName="border-white/10 bg-black/30 text-white"
                detailsClassName="border-white/10 bg-black/20"
                labelClassName="text-white/45"
              />
            </div>
          </div>

          <div
            ref={transcriptRef}
            className="flex-1 space-y-3 overflow-y-auto rounded-xl border p-3 sm:max-h-[380px] max-h-[45vh]"
            style={{ borderColor: `${colorHex}30` }}
          >
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === "user" ? "text-right" : "text-left"}>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
                  {message.role === "user" ? "You" : "Billy"}
                </p>
                <p
                  className="inline-block max-w-[96%] whitespace-pre-wrap rounded-lg border px-3 py-2 text-left text-sm leading-relaxed"
                  style={{
                    borderColor: message.role === "user" ? `${colorHex}50` : "rgba(255,255,255,0.14)",
                    color: message.role === "user" ? colorHex : "rgba(255,255,255,0.88)",
                    background: message.role === "user" ? `${colorHex}12` : "rgba(0,0,0,0.32)",
                  }}
                >
                  {message.content}
                </p>
              </div>
            ))}
            {isLoading && (
              <p className="text-left font-mono text-[11px] tracking-[0.16em]" style={{ color: colorHex }}>
                BILLY // SYNTHESIZING ▮ ▮ ▮
              </p>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="mt-4 flex shrink-0 flex-col gap-3 sm:flex-row">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={2}
              placeholder={inputPlaceholder}
              disabled={isLoading}
              className="w-full resize-none rounded-xl border bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-1"
              style={{ borderColor: `${colorHex}60`, outlineColor: colorHex }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl border px-5 py-2 text-xs font-mono uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderColor: `${colorHex}70`, color: colorHex, background: `${colorHex}12` }}
            >
              Transmit
            </button>
          </form>
        </section>
      )}
    </>
  );
};

export default BillyExhibitChat;
