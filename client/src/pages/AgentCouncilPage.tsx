/**
 * AgentCouncilPage.tsx — GestaltView Tribunal
 *
 * Standalone page at /tribunal.
 * Three modes:
 *   SESSION     — selected voices respond in sequence to the same prompt.
 *   DEBATE      — selected voices respond to each other, one turn at a time.
 *   ROUNDTABLE  — selected voices can address one another by name and chain follow-ups.
 *
 * Uses BillyLive aesthetic (JetBrains Mono, scanlines, sweep, teal-on-black).
 * Per-agent BillyBabylon orbs with mood states.
 * Wired to callBillyApi with per-agent embodimentProfileSlug + roomSlug='tribunal'.
 *
 * © Keith Soyka · GestaltView
 */

import {
  lazy,
  Suspense,
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from 'react';
import { Link, useLocation } from 'wouter';
import { toast } from 'sonner';
import { useBillySection } from '@/components/Billy';
import { PAGE_SEO, useSEO } from '@/hooks/useSEO';
import { callBillyApi } from '@/lib/billyApi';
import { useAuth } from '@/contexts/AuthContext';
import BillyMarkdown from '@/components/BillyMarkdown';
import { getAllEmbodimentProfiles } from '@/lib/embodimentRuntime';
import { getLaunchVisibleProfiles } from '@/lib/launchCore';
import {
  ADVANCED_TRIBUNAL_PARTICIPANT_LIMIT,
  advancedTribunalLockText,
  canUseAdvancedTribunal,
} from '@/lib/entitlements';
import { recordPersonaFailure, recordPersonaSuccess } from '@/lib/PersonaATC';
import { useTribunalRetry } from '@/hooks/useTribunalRetry';
import type { TrainerEmbodimentSlug } from '@shared/agent-trainer/embodiment';
import type { TribunalParticipantSummary, TribunalStance } from '@shared/roundtable/types';
import { extractTribunalMentions } from '@shared/roundtable/mentionParser';
import CreationActionBar from '@/components/roundtable/CreationActionBar';
import VoiceSidebar from '@/components/roundtable/VoiceSidebar';
import MentionAutocomplete from '@/components/roundtable/MentionAutocomplete';
import CreationPanel from '@/components/roundtable/CreationPanel';
import { appendInnerWorldCapture, appendScaffoldQueue, type CaptureOrb } from '@/components/Scaffold';
import { ThinkingAnimation } from '@/components/thinking/ThinkingAnimation';

const BillyBabylon = lazy(() => import('@/components/BillyBabylon'));

// ─── Theme ────────────────────────────────────────────────────────────────────

const T = {
  teal: '#00D4FF',
  dim: '#006B7F',
  dark: '#0A0F14',
  card: '#050A0E',
  black: '#000000',
};
const TRIBUNAL_THINKING_MESSAGES = [
  "The Tribunal is cross-examining the prompt for structural weaknesses.",
  "Seven voices are reviewing the claim. One of them brought a stapler.",
  "The constitution is being checked against the current weather.",
  "Deliberation is underway. Please stand by for a verdict shaped like context.",
  "The room is deciding whether the answer should be elegant or honest. Ideally both.",
];
const TRIBUNAL_RETRY_OPTIONS = { maxRetries: 2, backoffMs: [1000, 2000] };

// ─── Scoped styles (BillyLive aesthetic) ─────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');
  .ac-root * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes ac-float     { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-8px)} }
  @keyframes ac-float-med { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-4px)} }
  @keyframes ac-glitch {
    0%{transform:translate(0,0)} 12%{transform:translate(-2px,1px)} 24%{transform:translate(2px,-2px)}
    36%{transform:translate(-1px,-1px)} 48%{transform:translate(2px,1px)} 60%{transform:translate(-2px,0)}
    72%{transform:translate(1px,2px)} 84%{transform:translate(-1px,-2px)} 100%{transform:translate(0,0)}
  }
  @keyframes ac-sweep { 0%{top:-8%} 100%{top:108%} }
  @keyframes ac-msg-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ac-pulse-ring { 0%{box-shadow:0 0 0 0 rgba(0,212,255,.45)} 70%{box-shadow:0 0 0 8px rgba(0,212,255,0)} 100%{box-shadow:0 0 0 0 rgba(0,212,255,0)} }

  .ac-idle       { animation: ac-float 3.4s ease-in-out infinite; }
  .ac-listening, .ac-speaking { animation: ac-float-med 2s ease-in-out infinite; }
  .ac-processing { animation: ac-glitch .38s linear infinite; }
  .ac-active-orb { animation: ac-pulse-ring 1.8s ease-out infinite; }

  .ac-scanlines {
    position:fixed; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:1;
    background: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,212,255,.011) 2px,rgba(0,212,255,.011) 4px);
  }
  .ac-sweep {
    position:fixed; left:0; right:0; height:90px; pointer-events:none; z-index:2;
    background:linear-gradient(to bottom,transparent,rgba(0,212,255,.022),transparent);
    animation: ac-sweep 12s linear infinite;
  }
  .ac-msg-in  { animation: ac-msg-in .28s ease-out; }

  :root .ac-root ::-webkit-scrollbar { width:3px; }
  :root .ac-root ::-webkit-scrollbar-track { background:#000; }
  :root .ac-root ::-webkit-scrollbar-thumb { background:#006B7F; border-radius:2px; }
  :root .ac-root ::-webkit-scrollbar-thumb:hover { background:#00D4FF; }
  :root .ac-root textarea::placeholder { color:#006B7F; font-family:inherit; }
  :root .ac-root textarea:focus { outline:none; }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

type TribunalMode = 'session' | 'debate' | 'roundtable';
type AgentMood = 'idle' | 'listening' | 'processing' | 'speaking';

interface AgentSlot {
  slug: TrainerEmbodimentSlug;
  label: string;
  color: string;
}

interface TribunalMessage {
  id: string;
  role: 'user' | 'agent';
  agentSlug?: TrainerEmbodimentSlug;
  agentLabel?: string;
  agentColor?: string;
  content: string;
  ts: string;
  addressedTo?: string[];
  isAutoReply?: boolean;
  replyDepth?: number;
}

// ─── Fallback orb ─────────────────────────────────────────────────────────────

function OrbFallback({ size, color }: { size: number; color: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '9999px',
        background: `radial-gradient(circle at 30% 30%, ${color}44, rgba(5,10,14,0.92) 72%)`,
        boxShadow: `0 0 20px ${color}44`,
      }}
    />
  );
}

// ─── Agent orb card ───────────────────────────────────────────────────────────

function AgentOrbCard({
  agent,
  mood,
  isActive,
  isSelected,
  onSelect,
  responseCount,
}: {
  agent: AgentSlot;
  mood: AgentMood;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  responseCount: number;
}) {
  const moodClass =
    mood === 'idle'
      ? 'ac-idle'
      : mood === 'processing'
        ? 'ac-processing'
        : 'ac-speaking';

  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '14px 12px',
        background: isSelected
          ? 'rgba(0,212,255,0.08)'
          : isActive
            ? `${agent.color}11`
            : 'rgba(5,10,14,0.6)',
        border: isSelected
          ? '1px solid rgba(0,212,255,0.55)'
          : isActive
            ? `1px solid ${agent.color}55`
            : '1px solid rgba(0,212,255,0.12)',
        borderRadius: 16,
        cursor: 'pointer',
        transition: 'all 180ms ease',
        minWidth: 90,
        flexShrink: 0,
        boxShadow: isSelected
          ? '0 0 18px rgba(0,212,255,0.18)'
          : isActive
            ? `0 0 14px ${agent.color}22`
            : 'none',
      }}
    >
      <div
        className={isActive || isSelected ? 'ac-active-orb' : ''}
        style={{ borderRadius: '9999px' }}
      >
        <div className={moodClass} style={{ width: 56, height: 56 }}>
          <Suspense fallback={<OrbFallback size={56} color={agent.color} />}>
            <BillyBabylon
              size={56}
              mood={
                mood === 'idle' ? 'idle' : mood === 'processing' ? 'processing' : 'listening'
              }
            />
          </Suspense>
        </div>
      </div>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: '.18em',
          color: isSelected ? '#00D4FF' : isActive ? agent.color : 'rgba(0,212,255,0.55)',
          textTransform: 'uppercase',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 82,
        }}
      >
        {agent.label}
      </span>
      {responseCount > 0 && (
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8,
            color: `${agent.color}99`,
            letterSpacing: '.1em',
          }}
        >
          {responseCount}×
        </span>
      )}
    </button>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function agentColorFromSlug(slug: string): string {
  const palette = [
    '#00D4FF', '#7F5AF0', '#2CB67D', '#FF8906', '#E53170',
    '#A7F3D0', '#FDE68A', '#F87171', '#60A5FA', '#C084FC',
  ];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutLabel: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error(timeoutLabel));
    }, timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timeout);
        reject(error);
      });
  });
}

function buildDebatePrompt(question: string, priorResponses: string[]): string {
  if (priorResponses.length === 0) {
    return question;
  }

  return [
    question,
    "Respond to the other voices directly, not just to the user.",
    "Previous Tribunal voices:",
    ...priorResponses,
  ].join("\n\n");
}

const TRIBUNAL_STANCE_PROMPTS: Record<TribunalStance, string> = {
  synthesis: 'Synthesis / Integration - seek the through-line and reconcile tensions without flattening them.',
  imagistic: 'Metaphoric / Imagistic - respond with image, texture, and resonance.',
  skeptical: 'Empirical / Skeptical - ask for evidence, mechanism, and what would change your mind.',
  dialectical: 'Dialectical / Questioning - return questions that probe assumptions and hidden contradictions.',
  generative: 'Generative / Making - offer what could be created, built, or drafted next.',
  practical: 'Consequential / Practical - focus on actions, tradeoffs, and operational next steps.',
  custom: 'Custom Lens - stay in your own voice and stance while remaining explicit and precise.',
};

function inferDefaultTribunalStance(agent: AgentSlot): TribunalStance {
  const descriptor = `${agent.slug} ${agent.label}`.toLowerCase();

  if (agent.slug === 'billy' || /synth|integrat|cohere|bridge/.test(descriptor)) {
    return 'synthesis';
  }

  if (/poet|poetry|imag|metaphor|lyric|story|dream/.test(descriptor)) {
    return 'imagistic';
  }

  if (/scient|research|analyt|evidence|skept|probe/.test(descriptor)) {
    return 'skeptical';
  }

  if (/philos|question|dialect|inquiry/.test(descriptor)) {
    return 'dialectical';
  }

  if (/artist|maker|creative|design|build|craft|composer/.test(descriptor)) {
    return 'generative';
  }

  if (/strateg|planner|operator|architect|guardian|weaver|tailor|treasurer|keeper|translator/.test(descriptor)) {
    return 'practical';
  }

  return 'custom';
}

function formatTribunalStance(stance: TribunalStance): string {
  return TRIBUNAL_STANCE_PROMPTS[stance];
}

function buildTribunalResponsePrompt(input: {
  target: AgentSlot;
  stance: TribunalStance;
  turnSpeaker: string;
  turnContent: string;
  conversation: string[];
  addressedTo?: string[];
  depth: number;
  autoReply: boolean;
}): string {
  const addressing = input.addressedTo && input.addressedTo.length > 0
    ? `This turn is explicitly addressed to: ${input.addressedTo.join(", ")}.`
    : "This turn is open to the room, but you should only speak if you have something meaningful to add.";

  return [
    `You are ${input.target.label} in the GestaltView Tribunal roundtable.`,
    `Your epistemic stance is: ${formatTribunalStance(input.stance)}.`,
    addressing,
    input.autoReply
      ? `This is an automatic follow-up turn at reply depth ${input.depth}. Keep the reply focused and do not start a new digression if you have nothing useful to say.`
      : `This is a live turn in the room. If you have nothing useful to say, reply exactly [pass].`,
    `When you do speak, keep it concise, grounded, and directly responsive to the table.`,
    `You may address other participants by name using @Name when a follow-up is genuinely warranted.`,
    `Conversation so far:`,
    ...input.conversation,
    `Incoming turn from ${input.turnSpeaker}:`,
    input.turnContent,
  ].join("\n\n");
}

function buildTribunalConversation(messages: TribunalMessage[]): string[] {
  return messages.map((message) => {
    const speaker = message.role === 'user'
      ? 'User'
      : message.agentLabel ?? message.agentSlug ?? 'Agent';
    const tag = message.isAutoReply ? ' [auto]' : '';
    const mention = message.addressedTo && message.addressedTo.length > 0
      ? ` [@${message.addressedTo.join(', @')}]`
      : '';

    return `${speaker}${tag}${mention}: ${message.content}`;
  });
}

function buildRoundtableCaptureOrb(message: TribunalMessage, kind: 'scaffold' | 'inner-world'): CaptureOrb {
  const slug = message.agentSlug ?? 'tribunal';
  const now = new Date().toISOString();
  return {
    id: `roundtable-${message.id}-${kind}`,
    label: `${message.agentLabel ?? 'Tribunal'} ${kind}`,
    title: `${message.agentLabel ?? 'Tribunal'} · ${kind === 'scaffold' ? 'Scaffold' : 'Inner World'}`,
    text: message.content,
    source: 'typed',
    type: 'fragment',
    tags: ['tribunal', 'roundtable', kind, slug],
    resonance: 78,
    color: message.agentColor ?? T.teal,
    createdAt: now,
    status: kind === 'scaffold' ? 'pending' : 'saved',
    metadata: {
      createdAt: now,
      updatedAt: now,
      context: `Tribunal roundtable ${kind} capture`,
      originalAction: kind === 'scaffold' ? 'send-to-external-scaffold' : 'send-to-dynamic-inner-world',
      surface: 'forward',
      display: {
        surface: 'forward',
        x: 0.5,
        y: 0.5,
        displayMode: 'fragment-shard',
      },
      meaning: message.addressedTo?.length ? `Addressed to ${message.addressedTo.join(', ')}` : 'Roundtable excerpt',
      memory: message.isAutoReply ? 'Auto-reply turn' : 'User-selected turn',
    },
  };
}

function buildTranscriptExcerpt(message: TribunalMessage): string {
  const speaker = message.role === 'user'
    ? 'You'
    : message.agentLabel ?? message.agentSlug ?? 'Agent';

  return [
    `Tribunal excerpt from ${speaker}`,
    message.addressedTo?.length ? `Addressed to: ${message.addressedTo.join(', ')}` : null,
    message.content,
  ]
    .filter(Boolean)
    .join("\n\n");
}

const STORAGE_KEY = 'gv.tribunal.messages.v1';
const LEGACY_STORAGE_KEY = 'gv.agentcouncil.messages.v1';

function readStoredMessages(): TribunalMessage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TribunalMessage[]) : [];
  } catch {
    return [];
  }
}

function writeStoredMessages(msgs: TribunalMessage[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch { /* private mode */ }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgentCouncilPage() {
  useSEO(PAGE_SEO.tribunal);
  useBillySection('tribunal');
  const { tier, isAdmin } = useAuth();
  const { callWithRetry, isTribunalPassSignal } = useTribunalRetry();
  const canUseMultiVoice = isAdmin || canUseAdvancedTribunal({ tier });
  const lockText = advancedTribunalLockText(tier);
  const [location, setLocation] = useLocation();

  // ── Inject styles ──────────────────────────────────────────────────────────
  const styleInjected = useRef(false);
  useEffect(() => {
    if (styleInjected.current) return;
    const tag = document.createElement('style');
    tag.id = 'ac-scoped-styles';
    tag.textContent = STYLES;
    document.head.appendChild(tag);
    styleInjected.current = true;
    return () => {
      document.getElementById('ac-scoped-styles')?.remove();
      styleInjected.current = false;
    };
  }, []);

  // ── Build agent slots from embodiment registry ─────────────────────────────
  const [agents, setAgents] = useState<AgentSlot[]>([]);

  useEffect(() => {
    const profiles = getLaunchVisibleProfiles(getAllEmbodimentProfiles());
    const slots: AgentSlot[] = profiles.map((p) => ({
      slug: p.slug as TrainerEmbodimentSlug,
      // EmbodimentProfile uses publicName — not name
      label: p.publicName ?? p.immutableCore?.archetype ?? p.slug,
      color: agentColorFromSlug(p.slug),
    }));
    // Ensure billy is always first
    const sorted = [
      ...slots.filter((s) => s.slug === 'billy'),
      ...slots.filter((s) => s.slug !== 'billy'),
    ];
    setAgents(sorted);
  }, []);

  // ── State ──────────────────────────────────────────────────────────────────
  const [tribunalMode, setTribunalMode] = useState<TribunalMode>('session');
  const [selectedSlugs, setSelectedSlugs] = useState<Set<TrainerEmbodimentSlug>>(
    new Set(['billy'] as TrainerEmbodimentSlug[]),
  );
  const [rrIndex, setRrIndex] = useState(0);
  const [messages, setMessages] = useState<TribunalMessage[]>(() => readStoredMessages());
  const [input, setInput] = useState('');
  const [agentMoods, setAgentMoods] = useState<Record<string, AgentMood>>({});
  const [agentStances, setAgentStances] = useState<Record<string, TribunalStance>>({});
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [creationPanelOpen, setCreationPanelOpen] = useState(false);
  const [creationPanelSeed, setCreationPanelSeed] = useState('');
  const [creationPanelTitle, setCreationPanelTitle] = useState('Tribunal Creation Panel');
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist messages
  useEffect(() => { writeStoredMessages(messages); }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    if (!agents.length) {
      return;
    }

    setAgentStances((current) => {
      const next = { ...current };
      for (const agent of agents) {
        if (!next[agent.slug]) {
          next[agent.slug] = inferDefaultTribunalStance(agent);
        }
      }
      return next;
    });
  }, [agents]);

  useEffect(() => {
    const query = location.includes('?') ? location.split('?')[1] : window.location.search.slice(1);
    const params = new URLSearchParams(query);
    const candidate = params.get('candidate');
    if (candidate) {
      setCreationPanelSeed(candidate);
      setCreationPanelTitle('Tribunal Candidate');
      setCreationPanelOpen(true);
    }
  }, [location]);

  // Derived
  const selectedArray: AgentSlot[] = agents.filter((a) => selectedSlugs.has(a.slug));
  const visibleAgents = canUseMultiVoice ? agents : agents.slice(0, ADVANCED_TRIBUNAL_PARTICIPANT_LIMIT);
  const rrAgent: AgentSlot | undefined =
    selectedArray[rrIndex % Math.max(1, selectedArray.length)];
  const participantSummaries: TribunalParticipantSummary[] = useMemo(
    () => visibleAgents.map((agent) => ({
      slug: agent.slug,
      label: agent.label,
      color: agent.color,
      stance: agentStances[agent.slug] ?? inferDefaultTribunalStance(agent),
    })),
    [agentStances, visibleAgents],
  );
  const mentionQuery = useMemo(() => {
    const match = input.match(/(?:^|\s)@([^\n@]*)$/);
    return match?.[1]?.trim() ?? '';
  }, [input]);

  function toggleAgent(slug: TrainerEmbodimentSlug) {
    if (!canUseMultiVoice && !selectedSlugs.has(slug)) {
      return;
    }

    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        if (next.size === 1) return next; // always keep at least one
        next.delete(slug);
      } else {
        if (!canUseMultiVoice && next.size >= ADVANCED_TRIBUNAL_PARTICIPANT_LIMIT) {
          return next;
        }
        next.add(slug);
      }
      return next;
    });
    setRrIndex(0);
  }

  function selectAllVoices() {
    if (!canUseMultiVoice) {
      return;
    }
    setSelectedSlugs(new Set(agents.map((agent) => agent.slug)));
    setRrIndex(0);
  }

  const passRrBaton = useCallback(() => {
    setRrIndex((i) => (i + 1) % Math.max(1, selectedArray.length));
  }, [selectedArray.length]);

  const setMood = useCallback((slug: string, mood: AgentMood) => {
    setAgentMoods((prev) => ({ ...prev, [slug]: mood }));
  }, []);

  const addressAgent = useCallback((slug: TrainerEmbodimentSlug) => {
    const agent = agents.find((item) => item.slug === slug);
    if (!agent) {
      return;
    }
    setInput(`@${agent.label} `);
    textareaRef.current?.focus();
    setSidebarOpen(false);
  }, [agents]);

  const insertMention = useCallback((participant: TribunalParticipantSummary) => {
    setInput((current) => {
      const trimmed = current.trimEnd();
      const lastAt = trimmed.lastIndexOf('@');
      if (lastAt < 0) {
        return `${trimmed ? `${trimmed} ` : ''}@${participant.label} `;
      }
      return `${trimmed.slice(0, lastAt)}@${participant.label} `;
    });
    textareaRef.current?.focus();
  }, []);

  const openCreationPanel = useCallback((seed: string, title: string) => {
    setCreationPanelSeed(seed);
    setCreationPanelTitle(title);
    setCreationPanelOpen(true);
  }, []);

  const shareTranscript = useCallback(async (message: TribunalMessage) => {
    try {
      await navigator.clipboard.writeText(buildTranscriptExcerpt(message));
      toast.success('Tribunal excerpt copied.');
    } catch {
      toast.error('Could not copy the excerpt right now.');
    }
  }, []);

  const saveTribunalExcerpt = useCallback((message: TribunalMessage) => {
    try {
      const raw = window.localStorage.getItem('gv.roundtable.saved.v1');
      const current = raw ? (JSON.parse(raw) as TribunalMessage[]) : [];
      const next = [message, ...current].slice(0, 120);
      window.localStorage.setItem('gv.roundtable.saved.v1', JSON.stringify(next));
      toast.success('Saved to roundtable archive.');
    } catch {
      toast.error('Could not save this excerpt locally.');
    }
  }, []);

  // ── Send ───────────────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending || selectedArray.length === 0) return;
    setInput('');
    setIsSending(true);

    const userMsg: TribunalMessage = {
      id: uid(),
      role: 'user',
      content: text,
      ts: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const orderedTargets =
      tribunalMode === 'debate' && rrIndex > 0 && selectedArray.length > 1
        ? [...selectedArray.slice(rrIndex % selectedArray.length), ...selectedArray.slice(0, rrIndex % selectedArray.length)]
        : selectedArray;

    const workingMessages: TribunalMessage[] = [...messages, userMsg];

    orderedTargets.forEach((agent) => setMood(agent.slug, 'processing'));

    try {
      if (tribunalMode === 'roundtable') {
        const seenFollowUps = new Set<string>();
        const targetSlugs = new Set(selectedArray.map((agent) => agent.slug));
        const roundtableQueue: Array<{
          speakerLabel: string;
          content: string;
          target: AgentSlot;
          addressedTo: string[];
          depth: number;
          autoReply: boolean;
        }> = selectedArray.map((agent) => ({
          speakerLabel: 'You',
          content: text,
          target: agent,
          addressedTo: Array.from(targetSlugs),
          depth: 0,
          autoReply: false,
        }));

        const emitted: TribunalMessage[] = [];

        while (roundtableQueue.length > 0) {
          const turn = roundtableQueue.shift();
          if (!turn) {
            continue;
          }

          const stance = agentStances[turn.target.slug] ?? inferDefaultTribunalStance(turn.target);
          setMood(turn.target.slug, 'processing');

          try {
            const prompt = buildTribunalResponsePrompt({
              target: turn.target,
              stance,
              turnSpeaker: turn.speakerLabel,
              turnContent: turn.content,
              conversation: buildTribunalConversation(workingMessages),
              addressedTo: turn.addressedTo,
              depth: turn.depth,
              autoReply: turn.autoReply,
            });
            const result = await withTimeout(
              callWithRetry(
                () =>
                  callBillyApi(
                    prompt,
                    'tribunal',
                    'synthesis',
                    undefined,
                    turn.target.slug,
                    'tribunal',
                  ).then((value) => value.text),
                TRIBUNAL_RETRY_OPTIONS,
              ),
              18000,
              `${turn.target.label} timed out`,
            );

            if (!result.text) {
              recordPersonaFailure(turn.target.slug);
              continue;
            }

            if (isTribunalPassSignal(result.text)) {
              recordPersonaSuccess(turn.target.slug);
              continue;
            }

            recordPersonaSuccess(turn.target.slug);
            const addressedTo = extractTribunalMentions(
              result.text,
              selectedArray.map((agent) => ({
                slug: agent.slug,
                label: agent.label,
                color: agent.color,
              }))
            );
            const agentMsg: TribunalMessage = {
              id: uid(),
              role: 'agent',
              agentSlug: turn.target.slug,
              agentLabel: turn.target.label,
              agentColor: turn.target.color,
              content: result.text,
              ts: new Date().toISOString(),
              addressedTo,
              isAutoReply: turn.autoReply,
              replyDepth: turn.depth,
            };
            emitted.push(agentMsg);
            workingMessages.push(agentMsg);

            if (addressedTo.length > 0 && turn.depth < 3) {
              for (const targetSlug of addressedTo) {
                if (targetSlug === turn.target.slug) {
                  continue;
                }
                if (!targetSlugs.has(targetSlug)) {
                  continue;
                }
                const nextAgent = selectedArray.find((agent) => agent.slug === targetSlug);
                if (!nextAgent) {
                  continue;
                }
                const key = `${turn.target.slug}->${nextAgent.slug}:${turn.depth + 1}:${result.text.slice(0, 60)}`;
                if (seenFollowUps.has(key)) {
                  continue;
                }
                seenFollowUps.add(key);
                roundtableQueue.push({
                  speakerLabel: turn.target.label,
                  content: result.text,
                  target: nextAgent,
                  addressedTo: [targetSlug],
                  depth: turn.depth + 1,
                  autoReply: true,
                });
              }
            }
          } catch {
            recordPersonaFailure(turn.target.slug);
            const offlineMsg: TribunalMessage = {
              id: uid(),
              role: 'agent',
              agentSlug: turn.target.slug,
              agentLabel: turn.target.label,
              agentColor: turn.target.color,
              content: `[${turn.target.label} is temporarily offline.]`,
              ts: new Date().toISOString(),
              addressedTo: turn.addressedTo,
              isAutoReply: turn.autoReply,
              replyDepth: turn.depth,
            };
            emitted.push(offlineMsg);
            workingMessages.push(offlineMsg);
          } finally {
            setMood(turn.target.slug, 'idle');
          }
        }

        setMessages((prev) => [...prev, ...emitted]);
      } else {
        const replies: { agent: AgentSlot; text: string }[] = [];
        const priorResponses: string[] = [];

        for (const agent of orderedTargets) {
          try {
            const prompt = tribunalMode === 'debate' ? buildDebatePrompt(text, priorResponses) : text;
            const result = await withTimeout(
              callWithRetry(
                () =>
                  callBillyApi(
                    prompt,
                    'tribunal',
                    'synthesis',
                    undefined,
                    agent.slug,
                    'tribunal',
                  ).then((value) => value.text),
                TRIBUNAL_RETRY_OPTIONS,
              ),
              18000,
              `${agent.label} timed out`,
            );
            if (!result.text) {
              recordPersonaFailure(agent.slug);
              continue;
            }
            if (isTribunalPassSignal(result.text)) {
              recordPersonaSuccess(agent.slug);
              continue;
            }
            recordPersonaSuccess(agent.slug);
            replies.push({ agent, text: result.text });
            priorResponses.push(`[${agent.label}] ${result.text}`);
          } catch {
            recordPersonaFailure(agent.slug);
            replies.push({ agent, text: `[${agent.label} is temporarily offline.]` });
            priorResponses.push(`[${agent.label}] [offline]`);
          }
        }

        const agentMsgs: TribunalMessage[] = replies.map(({ agent, text: replyText }) => ({
          id: uid(),
          role: 'agent',
          agentSlug: agent.slug,
          agentLabel: agent.label,
          agentColor: agent.color,
          content: replyText,
          ts: new Date().toISOString(),
        }));

        setMessages((prev) => [...prev, ...agentMsgs]);

        if (tribunalMode === 'debate') {
          passRrBaton();
        }
      }
    } finally {
      orderedTargets.forEach((a) => setMood(a.slug, 'idle'));
      setIsSending(false);
    }
  }, [
    agentStances,
    callWithRetry,
    input,
    isSending,
    isTribunalPassSignal,
    messages,
    passRrBaton,
    rrIndex,
    selectedArray,
    setMood,
    tribunalMode,
  ]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  function clearTribunal() {
    setMessages([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch { /* ignore */ }
  }

  // ── Response count per agent ───────────────────────────────────────────────
  const responseCounts: Record<string, number> = {};
  for (const m of messages) {
    if (m.role === 'agent' && m.agentSlug) {
      responseCounts[m.agentSlug] = (responseCounts[m.agentSlug] ?? 0) + 1;
    }
  }

  const modeBadge =
    tribunalMode === 'session'
      ? `TRIBUNAL SESSION · ${selectedArray.length} VOICE${selectedArray.length !== 1 ? 'S' : ''}`
      : tribunalMode === 'debate'
        ? `TRIBUNAL DEBATE · ${rrAgent?.label?.toUpperCase() ?? '—'} STARTS`
        : `ROUNDTABLE · ${selectedArray.length} VOICE${selectedArray.length !== 1 ? 'S' : ''} IN MOTION`;

  useEffect(() => {
    if (canUseMultiVoice || selectedSlugs.size <= ADVANCED_TRIBUNAL_PARTICIPANT_LIMIT) return;
    const firstSelected = Array.from(selectedSlugs)[0] ?? 'billy';
    setSelectedSlugs(new Set([firstSelected] as TrainerEmbodimentSlug[]));
    setRrIndex(0);
  }, [canUseMultiVoice, selectedSlugs]);

  // ─── Render ────────────────────────────────────────────────────────────────

  const seedMessage: TribunalMessage = {
    id: `seed-${creationPanelSeed.slice(0, 18) || 'tribunal'}`,
    role: 'agent',
    agentLabel: creationPanelTitle,
    content: creationPanelSeed,
    ts: new Date().toISOString(),
  };

  const createFromCurrentDraft = () => {
    const seed = input.trim() || messages[messages.length - 1]?.content?.trim() || '';
    if (!seed) {
      toast.info('Type or select a message first, then create from it.');
      return;
    }
    openCreationPanel(seed, 'Tribunal Creation Panel');
  };

  const panelScaffold = () => {
    if (!seedMessage.content.trim()) {
      return;
    }
    appendScaffoldQueue(buildRoundtableCaptureOrb(seedMessage, 'scaffold'));
    toast.success('Tribunal excerpt queued to the scaffold.');
  };

  const panelInnerWorld = () => {
    if (!seedMessage.content.trim()) {
      return;
    }
    appendInnerWorldCapture(buildRoundtableCaptureOrb(seedMessage, 'inner-world'));
    toast.success('Tribunal excerpt stored in the Inner World.');
  };

  const panelCreationCorner = () => {
    if (!seedMessage.content.trim()) {
      return;
    }
    setLocation(`/creation-corner?seed=${encodeURIComponent(seedMessage.content)}&title=${encodeURIComponent(creationPanelTitle)}`);
  };

  const panelTribunal = () => {
    if (!seedMessage.content.trim()) {
      return;
    }
    setLocation(`/tribunal?candidate=${encodeURIComponent(seedMessage.content)}`);
  };

  const panelSave = () => {
    if (!seedMessage.content.trim()) {
      return;
    }
    saveTribunalExcerpt(seedMessage);
  };

  const panelShare = () => {
    if (!seedMessage.content.trim()) {
      return;
    }
    void shareTranscript(seedMessage);
  };

  return (
    <div
      className="ac-root"
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: T.black,
        color: '#E8F0FF',
        fontFamily: "'JetBrains Mono', monospace",
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div className="ac-scanlines" />
      <div className="ac-sweep" />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(127,90,240,0.06) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <header
        style={{
          position: 'relative',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '18px 24px 14px',
          borderBottom: '1px solid rgba(0,212,255,0.1)',
          flexShrink: 0,
          marginTop: 64,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/">
            <a
              style={{
                fontSize: 10,
                letterSpacing: '.2em',
                color: 'rgba(0,212,255,0.6)',
                textDecoration: 'none',
                border: '1px solid rgba(0,212,255,0.18)',
                padding: '6px 14px',
                borderRadius: 6,
              }}
            >
              ← HOME
            </a>
          </Link>
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '.32em',
                color: 'rgba(0,212,255,0.45)',
                textTransform: 'uppercase',
              }}
            >
              GESTALTVIEW
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '.08em',
                color: '#00D4FF',
                textShadow: '0 0 18px rgba(0,212,255,0.55)',
              }}
            >
              TRIBUNAL
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              gap: 4,
              background: 'rgba(0,212,255,0.05)',
              border: '1px solid rgba(0,212,255,0.14)',
              borderRadius: 8,
              padding: 3,
            }}
          >
            {(['session', 'debate', 'roundtable'] as TribunalMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => { setTribunalMode(mode); setRrIndex(0); }}
                style={{
                  fontSize: 9,
                  letterSpacing: '.18em',
                  padding: '5px 12px',
                  borderRadius: 5,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  background: tribunalMode === mode ? 'rgba(0,212,255,0.18)' : 'transparent',
                  color: tribunalMode === mode ? '#00D4FF' : 'rgba(0,212,255,0.45)',
                  transition: 'all 150ms',
                  textTransform: 'uppercase',
                }}
              >
                {mode === 'session' ? 'SESSION' : mode === 'debate' ? 'DEBATE' : 'ROUNDTABLE'}
              </button>
            ))}
          </div>

          {canUseMultiVoice && (
            <button
              onClick={selectAllVoices}
              style={{
                fontSize: 9,
                letterSpacing: '.2em',
                color: 'rgba(0,212,255,0.75)',
                background: 'rgba(0,212,255,0.06)',
                border: '1px solid rgba(0,212,255,0.22)',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              SELECT ALL VOICES
            </button>
          )}

          <button
            onClick={createFromCurrentDraft}
            style={{
              fontSize: 9,
              letterSpacing: '.2em',
              color: 'rgba(52,211,153,0.9)',
              background: 'rgba(52,211,153,0.08)',
              border: '1px solid rgba(52,211,153,0.22)',
              borderRadius: 6,
              padding: '6px 12px',
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            ⊕ CREATE
          </button>

          <button
            onClick={clearTribunal}
            style={{
              fontSize: 9,
              letterSpacing: '.2em',
              color: 'rgba(255,80,80,0.6)',
              background: 'transparent',
              border: '1px solid rgba(255,80,80,0.2)',
              borderRadius: 6,
              padding: '6px 12px',
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            CLEAR
          </button>
        </div>
      </header>

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <VoiceSidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          participants={participantSummaries}
          selectedSlugs={selectedSlugs}
          moods={agentMoods}
          responseCounts={responseCounts}
          stances={agentStances}
          onToggleOpen={() => setSidebarOpen((current) => !current)}
          onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
          onSelectParticipant={(slug) => {
            if (tribunalMode === 'debate') {
              const idx = selectedArray.findIndex((agent) => agent.slug === slug);
              if (idx >= 0) {
                setRrIndex(idx);
                return;
              }
            }
            toggleAgent(slug as TrainerEmbodimentSlug);
          }}
          onAddressParticipant={(slug) => addressAgent(slug as TrainerEmbodimentSlug)}
          onStanceChange={(slug, stance) => setAgentStances((current) => ({ ...current, [slug]: stance }))}
        />

        <main
          style={{
            position: 'relative',
            minWidth: 0,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 10,
              padding: '16px 20px 12px',
              borderBottom: '1px solid rgba(0,212,255,0.08)',
            }}
          >
            <div
              style={{
                fontSize: 8,
                letterSpacing: '.22em',
                color: 'rgba(0,212,255,0.55)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#00D4FF',
                  boxShadow: '0 0 6px #00D4FF',
                  display: 'inline-block',
                }}
              />
              {modeBadge}
              {!canUseMultiVoice && (
                <span style={{ color: 'rgba(253,230,138,0.78)' }}>
                  · {lockText.toUpperCase()}
                </span>
              )}
              {tribunalMode === 'debate' && selectedArray.length > 1 && (
                <button
                  onClick={passRrBaton}
                  style={{
                    marginLeft: 8,
                    fontSize: 8,
                    letterSpacing: '.18em',
                    color: '#00D4FF',
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.28)',
                    borderRadius: 4,
                    padding: '3px 10px',
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  ROTATE STARTER →
                </button>
              )}
              {tribunalMode === 'roundtable' && (
                <span style={{ color: 'rgba(167,139,250,0.78)' }}>
                  · DIs can address one another by name
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              minHeight: 0,
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 220,
                  gap: 12,
                  opacity: 0.45,
                }}
              >
                <div
                  style={{
                    width: 2,
                    height: 48,
                    background: 'linear-gradient(to bottom, rgba(0,212,255,0.6), transparent)',
                  }}
                />
                <span style={{ fontSize: 10, letterSpacing: '.28em', color: '#00D4FF' }}>
                  TRIBUNAL AWAITS
                </span>
                <span style={{ fontSize: 9, letterSpacing: '.18em', color: 'rgba(0,212,255,0.4)', textAlign: 'center' }}>
                  {tribunalMode === 'session'
                    ? 'ALL SELECTED VOICES WILL RESPOND IN SEQUENCE'
                    : tribunalMode === 'debate'
                      ? 'VOICES WILL RESPOND TO ONE ANOTHER IN TURN'
                      : 'THE TABLE CAN ADDRESS ANY OTHER VOICE BY NAME'}
                </span>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === 'user';
                const accentColor = msg.agentColor ?? T.teal;
                return (
                  <div
                    key={msg.id}
                    className="ac-msg-in group"
                    style={{
                      display: 'flex',
                      flexDirection: isUser ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: 12,
                    }}
                  >
                    {!isUser && (
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '9999px',
                          border: `1px solid ${accentColor}55`,
                          background: `${accentColor}11`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          color: accentColor,
                          flexShrink: 0,
                          boxShadow: `0 0 10px ${accentColor}22`,
                        }}
                      >
                        {(msg.agentLabel ?? 'A').slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div
                      style={{
                        maxWidth: 'min(78ch, 72%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isUser ? 'flex-end' : 'flex-start',
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 8,
                          letterSpacing: '.2em',
                          color: isUser ? 'rgba(232,240,255,0.38)' : `${accentColor}cc`,
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        {!isUser && (
                          <span
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              background: accentColor,
                              display: 'inline-block',
                              boxShadow: `0 0 5px ${accentColor}`,
                            }}
                          />
                        )}
                        {isUser ? 'YOU' : msg.agentLabel?.toUpperCase()}
                        <span style={{ opacity: 0.45, fontSize: 7 }}>
                          {new Date(msg.ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        {msg.isAutoReply && (
                          <span style={{ color: 'rgba(167,139,250,0.8)' }}>AUTO</span>
                        )}
                        {typeof msg.replyDepth === 'number' && msg.replyDepth > 0 && (
                          <span style={{ color: 'rgba(0,212,255,0.55)' }}>DEPTH {msg.replyDepth}</span>
                        )}
                      </div>

                      <div
                        style={{
                          padding: '12px 16px',
                          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                          background: isUser ? 'rgba(232,240,255,0.06)' : `${accentColor}0d`,
                          border: isUser ? '1px solid rgba(232,240,255,0.1)' : `1px solid ${accentColor}33`,
                          boxShadow: isUser ? 'none' : `0 0 18px ${accentColor}11`,
                          fontSize: 13,
                          lineHeight: 1.7,
                          color: isUser ? 'rgba(232,240,255,0.85)' : 'rgba(210,245,255,0.9)',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {isUser ? (
                          <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                        ) : (
                          <BillyMarkdown content={msg.content} className="" />
                        )}
                      </div>

                      {!isUser && msg.addressedTo && msg.addressedTo.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {msg.addressedTo.map((target) => (
                            <span
                              key={`${msg.id}-${target}`}
                              style={{
                                borderRadius: 999,
                                border: '1px solid rgba(0,212,255,0.2)',
                                background: 'rgba(0,212,255,0.06)',
                                color: 'rgba(0,212,255,0.75)',
                                padding: '2px 8px',
                                fontSize: 8,
                                letterSpacing: '.18em',
                              }}
                            >
                              @{target}
                            </span>
                          ))}
                        </div>
                      )}

                      {!isUser && (
                        <CreationActionBar
                          content={msg.content}
                          onScaffold={() => {
                            appendScaffoldQueue(buildRoundtableCaptureOrb(msg, 'scaffold'));
                            toast.success('Queued for the scaffold.');
                          }}
                          onInnerWorld={() => {
                            appendInnerWorldCapture(buildRoundtableCaptureOrb(msg, 'inner-world'));
                            toast.success('Stored in the Inner World.');
                          }}
                          onCreationCorner={() => openCreationPanel(msg.content, `${msg.agentLabel ?? 'Tribunal'} → Creation Corner`)}
                          onTribunal={() => {
                            openCreationPanel(msg.content, `${msg.agentLabel ?? 'Tribunal'} → Tribunal`);
                            setLocation(`/tribunal?candidate=${encodeURIComponent(msg.content)}`);
                          }}
                          onSave={() => saveTribunalExcerpt(msg)}
                          onShare={() => void shareTranscript(msg)}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isSending && (
              <div className="ac-msg-in" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ThinkingAnimation diName="Tribunal" messages={TRIBUNAL_THINKING_MESSAGES} interval={4200} />
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div
            style={{
              flexShrink: 0,
              borderTop: '1px solid rgba(0,212,255,0.1)',
              padding: '14px 20px 20px',
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: 8,
                letterSpacing: '.2em',
                color: 'rgba(0,212,255,0.35)',
                marginBottom: 10,
              }}
            >
              {tribunalMode === 'session'
                ? `SPEAK TO ${selectedArray.length} VOICE${selectedArray.length !== 1 ? 'S' : ''} · ENTER TO SEND`
                : tribunalMode === 'debate'
                  ? `DEBATE STARTS WITH ${rrAgent?.label?.toUpperCase() ?? '—'} · ENTER TO SEND · CLICK A VOICE TO ROTATE`
                  : 'ROUNDTABLE MODE · MENTIONS CAN TRIGGER FOLLOW-UP VOICES'}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-end',
                background: 'rgba(0,212,255,0.04)',
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: 12,
                padding: '10px 12px',
                boxShadow: '0 0 12px rgba(0,212,255,0.06)',
                position: 'relative',
              }}
            >
              <div style={{ position: 'relative', flex: 1 }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    tribunalMode === 'session'
                      ? 'Address the tribunal…'
                      : tribunalMode === 'debate'
                        ? `Start the debate with ${rrAgent?.label ?? 'the selected voice'}…`
                        : 'Address any voice by name…'
                  }
                  rows={2}
                  disabled={isSending}
                  style={{
                    width: '100%',
                    resize: 'none',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'rgba(232,240,255,0.88)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    lineHeight: 1.6,
                    caretColor: '#00D4FF',
                  }}
                />
                {mentionQuery ? (
                  <MentionAutocomplete
                    query={mentionQuery}
                    participants={participantSummaries}
                    onPick={insertMention}
                  />
                ) : null}
              </div>
              <button
                onClick={() => void handleSend()}
                disabled={isSending || !input.trim()}
                style={{
                  flexShrink: 0,
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: isSending || !input.trim() ? 'rgba(0,212,255,0.06)' : 'rgba(0,212,255,0.22)',
                  color: isSending || !input.trim() ? 'rgba(0,212,255,0.3)' : '#00D4FF',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '.22em',
                  cursor: isSending || !input.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 150ms',
                  boxShadow: !isSending && input.trim() ? '0 0 14px rgba(0,212,255,0.28)' : 'none',
                }}
              >
                SEND
              </button>
            </div>
          </div>
        </main>
      </div>

      <CreationPanel
        open={creationPanelOpen}
        title={creationPanelTitle}
        content={creationPanelSeed}
        onClose={() => setCreationPanelOpen(false)}
        onScaffold={panelScaffold}
        onInnerWorld={panelInnerWorld}
        onCreationCorner={panelCreationCorner}
        onTribunal={panelTribunal}
        onSave={panelSave}
        onShare={panelShare}
      />
    </div>
  );
}
