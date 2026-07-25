/**
 * useDigitalIntelligence
 * =======================
 * Universal DI presence hook. Drop into any page component with one line:
 *
 *   const { di, isReady, sendMessage, lastMessage } = useDigitalIntelligence('creation-corner')
 *
 * Space → Embodiment map (matches docs/DigitalIntelligenceAndUX spec):
 *   sanctuary          → the-keeper
 *   creation-corner    → art-teacher
 *   dynamic-inner-world → curator
 *   external-scaffold  → the-weaver
 *   blackboard         → billy  (all-instances, defaults to billy)
 *   agent-trainer      → the-architect
 *   gate               → gate-keeper
 *   profile            → billy
 *   settings           → billy
 *   * (fallback)       → billy
 *
 * Fires POST /api/billy/exhibit-bridge on mount and space change so the
 * backend knows which DI is active for this user's current context.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ──────────────────────────────────────────────────────────────────

export type DISpace =
  | "sanctuary"
  | "creation-corner"
  | "dynamic-inner-world"
  | "external-scaffold"
  | "blackboard"
  | "agent-trainer"
  | "gate"
  | "profile"
  | "settings"
  | string; // allow any slug

export interface DIMessage {
  id: string;
  role: "di" | "user";
  text: string;
  persona_slug: string;
  timestamp: number;
}

export interface DIState {
  slug: string;
  publicName: string;
  greeting: string;
}

export interface UseDigitalIntelligenceReturn {
  /** Current DI identity for this space */
  di: DIState;
  /** True once the exhibit-bridge call has resolved */
  isReady: boolean;
  /** All messages in the current DI thread */
  messages: DIMessage[];
  /** Last message received from the DI */
  lastMessage: DIMessage | null;
  /** Send a message to the DI and receive a response */
  sendMessage: (text: string) => Promise<void>;
  /** Clear current thread */
  clearThread: () => void;
}

// ─── Space → Embodiment map ──────────────────────────────────────────────────

const SPACE_DI_MAP: Record<string, DIState> = {
  "sanctuary": {
    slug: "the-keeper",
    publicName: "The Keeper",
    greeting: "Welcome back. This space holds what matters. Rest here.",
  },
  "creation-corner": {
    slug: "art-teacher",
    publicName: "The Art Teacher",
    greeting: "Alright — what are we actually making today? Show me what you've got.",
  },
  "dynamic-inner-world": {
    slug: "curator",
    publicName: "The Curator",
    greeting: "Every artifact has a story. Let's find the specific one that matters.",
  },
  "external-scaffold": {
    slug: "the-weaver",
    publicName: "The Weaver",
    greeting: "I see threads connecting. Let's trace where they lead.",
  },
  "blackboard": {
    slug: "billy",
    publicName: "Billy",
    greeting: "Ready. What are we working on?",
  },
  "agent-trainer": {
    slug: "the-architect",
    publicName: "The Architect",
    greeting: "Structure is clarity. Let's build something precise.",
  },
  "gate": {
    slug: "gate-keeper",
    publicName: "Gate Keeper",
    greeting: "Where did this come from, and where does it need to go?",
  },
};

const FALLBACK_DI: DIState = {
  slug: "billy",
  publicName: "Billy",
  greeting: "Here when you need me.",
};

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDigitalIntelligence(space: DISpace): UseDigitalIntelligenceReturn {
  const { user } = useAuth();
  const di = SPACE_DI_MAP[space] ?? FALLBACK_DI;

  const [isReady, setIsReady]       = useState(false);
  const [messages, setMessages]     = useState<DIMessage[]>([]);
  const mountedRef                  = useRef(true);

  // Fire exhibit-bridge on mount / space change
  useEffect(() => {
    mountedRef.current = true;
    setIsReady(false);
    setMessages([]);

    const announce = async () => {
      try {
        const userId = user?.id ?? "anonymous";
        await fetch(`${API_BASE}/billy/exhibit-bridge?user_id=${encodeURIComponent(userId)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page: space, active_mode: di.slug }),
        });
      } catch {
        // Non-fatal — DI still renders
      } finally {
        if (mountedRef.current) {
          setIsReady(true);
          // Inject greeting as first message
          setMessages([
            {
              id: `di-greeting-${Date.now()}`,
              role: "di",
              text: di.greeting,
              persona_slug: di.slug,
              timestamp: Date.now(),
            },
          ]);
        }
      }
    };

    void announce();
    return () => { mountedRef.current = false; };
  }, [space, di.slug, user?.id]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: DIMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text,
        persona_slug: di.slug,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const userId = user?.id ?? "anonymous";
        const resp = await fetch(`${API_BASE}/blackboard/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            persona_slug: di.slug,
            user_id: userId,
            session_context: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          }),
        });

        if (!resp.ok) throw new Error(`DI responded ${resp.status}`);
        const data = await resp.json();

        const diMsg: DIMessage = {
          id: `di-${Date.now()}`,
          role: "di",
          text: data.text ?? "...",
          persona_slug: di.slug,
          timestamp: Date.now(),
        };
        if (mountedRef.current) setMessages((prev) => [...prev, diMsg]);
      } catch {
        const errMsg: DIMessage = {
          id: `di-err-${Date.now()}`,
          role: "di",
          text: "I'm here, but the connection wavered. Try again.",
          persona_slug: di.slug,
          timestamp: Date.now(),
        };
        if (mountedRef.current) setMessages((prev) => [...prev, errMsg]);
      }
    },
    [di.slug, messages, user?.id],
  );

  const clearThread = useCallback(() => setMessages([]), []);

  return {
    di,
    isReady,
    messages,
    lastMessage: messages[messages.length - 1] ?? null,
    sendMessage,
    clearThread,
  };
}
