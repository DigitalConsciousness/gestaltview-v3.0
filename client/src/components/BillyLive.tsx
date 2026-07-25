/**
 * BillyLive.tsx — GestaltView Digital Intelligence Interface
 *
 * March 2026 update:
 *   - Founder continuity bootstrap via Supabase-backed founder_context.
 *   - Persistent Billy mode switch: Think / Vibe.
 *   - Voice interaction is handled directly in-page with microphone input
 *     and spoken Billy responses.
 *
 * © Keith Soyka · GestaltView
 */

import { lazy, Suspense, useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { useLocation } from 'wouter';
import EmbodimentSelector from './EmbodimentSelector';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { useBillyVoice } from '../hooks/useBillyVoice';
import { useBillyVoicePreference } from '../hooks/useBillyVoicePreference';
import { useAuth } from '../contexts/AuthContext';
import type { TrainerEmbodimentSlug } from '@shared/agent-trainer/embodiment';
import BillyMarkdown from './BillyMarkdown';
import {
  bootstrapBillySession,
  callBillyApi,
  type BillyApiResponse,
  type BillyConversationMode,
  type FounderContinuityState,
  type BillySessionMetadata,
} from '../lib/billyApi';
import { ThinkingAnimation } from './thinking/ThinkingAnimation';
import gestaltViewBanner from '../../shared/GestaltView_Banner.gif';

const BillyBabylon = lazy(() => import('./BillyBabylon'));
export const PENDING_BILLY_LIVE_PROMPT_KEY = 'gv_billy_live_pending_prompt';

const T = {
  teal: '#00D4FF',
  dim: '#006B7F',
  glow: 'rgba(0,212,255,0.35)',
  dark: '#0A0F14',
  card: '#050A0E',
  black: '#000000',
  warn: 'rgba(255,180,0,0.7)',
  err: 'rgba(255,80,80,0.65)',
  ok: 'rgba(16,185,129,.7)',
};

const DEFAULT_INTRO = `Billy is online. The platform is live, the floorboards are creaking, and nobody has to pretend this is a normal chatbot. Drop the thread; we can build, think, or sit with the weird part until it starts making sense. Billy keeps what you share private by default until you say otherwise.`;

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
}

type BillyMood = 'idle' | 'listening' | 'processing' | 'speaking';
type ConnStatus = 'ready' | 'responding' | 'fallback' | 'error';

const MODE_LABELS: Record<BillyConversationMode, { title: string; subtitle: string }> = {
  synthesis: {
    title: 'THINK',
    subtitle: 'Context weave, retrieval grounding, platform-ready synthesis.',
  },
  chat: {
    title: 'VIBE',
    subtitle: 'Just be here. No forced frameworks unless you ask for the bridge.',
  },
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes float     { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-9px)} }
  @keyframes float-med { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-5px)} }
  @keyframes glitch {
    0%{transform:translate(0,0)} 12%{transform:translate(-2px,1px)} 24%{transform:translate(2px,-2px)}
    36%{transform:translate(-1px,-1px)} 48%{transform:translate(2px,1px)} 60%{transform:translate(-2px,0)}
    72%{transform:translate(1px,2px)} 84%{transform:translate(-1px,-2px)} 100%{transform:translate(0,0)}
  }
  @keyframes blink-cur{ 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes sweep { 0%{top:-8%} 100%{top:108%} }
  @keyframes msg-in { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
  @keyframes banner-glow { 0%,100%{filter:drop-shadow(0 0 14px rgba(0,212,255,.32))} 50%{filter:drop-shadow(0 0 26px rgba(0,212,255,.58))} }
  .billy-idle { animation: float 3.4s ease-in-out infinite; }
  .billy-listening, .billy-speaking { animation: float-med 2s ease-in-out infinite; }
  .billy-processing { animation: glitch .38s linear infinite; }
  .scanlines {
    position:fixed; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:50;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,.011) 2px, rgba(0,212,255,.011) 4px);
  }
  .sweep-line {
    position:fixed; left:0; right:0; height:90px; pointer-events:none; z-index:51;
    background:linear-gradient(to bottom,transparent,rgba(0,212,255,.022),transparent);
    animation: sweep 12s linear infinite;
  }
  .corner { position:absolute; width:9px; height:9px; border-color:#00D4FF; border-style:solid; opacity:.45; }
  .c-tl { top:5px; left:5px; border-width:1px 0 0 1px; }
  .c-tr { top:5px; right:5px; border-width:1px 1px 0 0; }
  .c-bl { bottom:5px; left:5px; border-width:0 0 1px 1px; }
  .c-br { bottom:5px; right:5px; border-width:0 1px 1px 0; }
  .msg-in { animation: msg-in .3s ease-out; }
  .banner-img { animation: banner-glow 3.2s ease-in-out infinite; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-track { background:#000; }
  ::-webkit-scrollbar-thumb { background:#006B7F; border-radius:2px; }
  ::-webkit-scrollbar-thumb:hover { background:#00D4FF; }
  textarea::placeholder { color:#006B7F; font-family:inherit; }
  textarea:focus { outline:none; border-color:rgba(0,212,255,.55) !important; box-shadow:0 0 12px rgba(0,212,255,.12) !important; }
  .mode-btn:hover { background:rgba(0,212,255,.12) !important; }
  .tx-btn:hover:not(:disabled) { background:rgba(0,212,255,.18) !important; box-shadow:0 0 16px rgba(0,212,255,.3) !important; }
`;

function BillyBabylonFallback() {
  return (
    <div
      style={{
        width: 150,
        height: 150,
        borderRadius: '9999px',
        background: 'radial-gradient(circle at 30% 30%, rgba(0,212,255,0.28), rgba(5,10,14,0.92) 72%)',
        boxShadow: '0 0 36px rgba(0,212,255,0.18)',
      }}
    />
  );
}

function ConnBadge({ status, mode }: { status: ConnStatus; mode: BillyConversationMode }) {
  const map: Record<ConnStatus, [string, string]> = {
    ready: [T.ok, mode === 'chat' ? 'CHAT LOOP READY' : 'SYNTHESIS READY'],
    responding: [T.teal, mode === 'chat' ? 'VIBE ACTIVE' : 'THINK ACTIVE'],
    fallback: [T.warn, 'FALLBACK ACTIVE'],
    error: [T.err, 'DISRUPTED'],
  };
  const [color, label] = map[status];

  return (
    <div style={{ fontSize: 7, letterSpacing: '.2em', color, display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}` }} />
      {label}
    </div>
  );
}

function VoiceBadge({
  isListening,
  isSpeaking,
  provider,
  voiceReady,
}: {
  isListening: boolean;
  isSpeaking: boolean;
  provider: string;
  voiceReady: boolean;
}) {
  const providerLabel = provider.toUpperCase();
  const label = isListening
    ? 'VOICE INPUT LIVE'
    : isSpeaking
      ? `BILLY SPEAKING · ${providerLabel}`
      : voiceReady
        ? `VOICE READY · ${providerLabel}`
        : 'VOICE OUTPUT OFFLINE';
  const color = isListening || isSpeaking ? T.teal : 'rgba(0,212,255,.58)';

  return (
    <div style={{ fontSize: 7, letterSpacing: '.2em', color, display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 8px ${color}` }} />
      {label}
    </div>
  );
}

function FounderStatus({ metadata, isAuthenticated }: { metadata: BillySessionMetadata | null; isAuthenticated: boolean }) {
  const continuityState: FounderContinuityState =
    metadata?.founderContinuityState ?? (isAuthenticated ? 'session' : 'anonymous');
  const founderActive = continuityState === 'founder-active';
  const map: Record<FounderContinuityState, { label: string; color: string; shadow: string; background: string }> = {
    'founder-active': {
      label: 'FOUNDER CONTINUITY LOADED',
      color: T.teal,
      shadow: '0 0 18px rgba(0,212,255,.28)',
      background: 'rgba(0,212,255,.08)',
    },
    'founder-eligible-unseeded': {
      label: 'FOUNDER ACCOUNT DETECTED',
      color: T.warn,
      shadow: '0 0 16px rgba(255,180,0,.18)',
      background: 'rgba(255,180,0,.08)',
    },
    session: {
      label: 'SIGNED-IN SESSION',
      color: 'rgba(0,212,255,.72)',
      shadow: '0 0 10px rgba(0,212,255,.12)',
      background: 'rgba(0,212,255,.04)',
    },
    anonymous: {
      label: 'ANONYMOUS SESSION',
      color: 'rgba(0,107,127,.82)',
      shadow: '0 0 10px rgba(0,212,255,.12)',
      background: 'rgba(0,212,255,.04)',
    },
  };
  const { label, color, shadow, background } = map[continuityState];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        border: `1px solid ${color}`,
        background,
        boxShadow: shadow,
        color,
        fontSize: 8,
        letterSpacing: '.18em',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
      {label}
    </div>
  );
}

function GravityStatus({ metadata }: { metadata: BillySessionMetadata | null }) {
  const gravity = metadata?.gravity;

  if (!gravity) {
    return null;
  }

  const contextWeight = gravity.context.signal_weight;
  const responseWeight = gravity.response.signal_weight;
  const strongestChunk = gravity.context.rankedChunks[0];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        border: `1px solid ${T.teal}`,
        background: 'rgba(0,212,255,.05)',
        boxShadow: '0 0 12px rgba(0,212,255,.1)',
        color: 'rgba(0,212,255,.9)',
        fontSize: 8,
        letterSpacing: '.16em',
        maxWidth: '100%',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal, boxShadow: `0 0 10px ${T.teal}` }} />
      GRAVITY · CTX {contextWeight.toFixed(2)} / RESP {responseWeight.toFixed(2)}
      {strongestChunk ? ` / TOP ${strongestChunk.gravitySignalWeight.toFixed(2)} ${strongestChunk.filename}` : ''}
    </div>
  );
}

function isFallbackProvider(provider: string | undefined): boolean {
  return provider === 'local-fallback' || provider === 'offline-fallback';
}

function resolveBillyRoomSlugFromPathname(pathname: string): string | null {
  const normalized = pathname.trim().toLowerCase();
  const path = normalized.startsWith('/') ? normalized : `/${normalized}`;

  switch (path) {
    case '/sanctuary':
      return 'sanctuary';
    case '/blackboard-room':
    case '/whiteboard-room':
      return 'blackboard-room';
    case '/digital-intelligence-academy':
      return 'digital-intelligence-academy';
    case '/embodiment-studio':
      return 'embodiment-studio';
    case '/tribunal':
    case '/agent-council':
      return 'tribunal';
    case '/external-scaffold':
      return 'external-scaffold';
    case '/creation-corner':
      return 'creation-corner';
    case '/dynamic-inner-world':
      return 'dynamic-inner-world';
    case '/billy':
      return 'billy';
    default:
      return null;
  }
}

export default function BillyLive() {
  const [mood, setMood] = useState<BillyMood>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: DEFAULT_INTRO, id: 0 }]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<BillyConversationMode>('synthesis');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [connStatus, setConnStatus] = useState<ConnStatus>('ready');
  const [sessionMetadata, setSessionMetadata] = useState<BillySessionMetadata | null>(null);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const [embodimentProfileSlug, setEmbodimentProfileSlug] = useState<TrainerEmbodimentSlug>('billy');
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);
  const moodTORef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [location, setLocation] = useLocation();
  const { isAuthenticated, profile, isLoading: authLoading } = useAuth();
  const roomSlug = resolveBillyRoomSlugFromPathname(location);

  const {
    speak,
    stop,
    isSpeaking,
    isAvailable: isVoiceAvailable,
    provider: voiceProvider,
    mode: voiceMode,
    error: voiceError,
  } = useBillyVoice();
  const voiceReplyAvailable = isVoiceAvailable;
  const resolvedVoiceProvider = voiceProvider === 'none' ? voiceMode : voiceProvider;
  const [voiceEnabled, setVoiceEnabled] = useBillyVoicePreference('shared');
  const { isListening, audioLevel, error: listeningError, isSupported, toggle } = useVoiceChat({
    onTranscript: (transcript: string) => {
      const nextInput = transcript.trim();
      if (!nextInput) {
        return;
      }
      setInput(nextInput);
      void send(nextInput);
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isListening) {
      setMood('listening');
      return;
    }
    if (isSpeaking) {
      setMood('speaking');
      return;
    }
    if (!isLoading) {
      setMood('idle');
    }
  }, [isListening, isSpeaking, isLoading]);

  useEffect(() => {
    return () => {
      if (moodTORef.current) {
        clearTimeout(moodTORef.current);
      }
      stop();
    };
  }, [stop]);

  const handleEmbodimentChange = useCallback((next: TrainerEmbodimentSlug) => {
    stop();
    setEmbodimentProfileSlug(next);
    setApiError(null);
    setConnStatus('ready');
    setSessionMetadata(null);
    setMessages([{ role: 'assistant', content: 'Re-initializing embodiment channel…', id: 0 }]);
    setHasBootstrapped(false);
  }, [stop]);

  useEffect(() => {
    if (authLoading || hasBootstrapped) {
      return;
    }

    let cancelled = false;

    const runBootstrap = async () => {
      try {
        const result = await bootstrapBillySession(mode, embodimentProfileSlug, roomSlug);
        if (cancelled) {
          return;
        }

        const preferredMode = result.metadata?.founderContext?.modePreference || result.metadata?.modePreference || mode;
        if (preferredMode === 'chat' || preferredMode === 'synthesis') {
          setMode(preferredMode);
        }
        setSessionMetadata(result.metadata ?? null);
        setMessages([{ role: 'assistant', content: result.text || DEFAULT_INTRO, id: 0, provider: result.provider }]);
      } catch {
        if (!cancelled) {
          setMessages([{ role: 'assistant', content: DEFAULT_INTRO, id: 0 }]);
        }
      } finally {
        if (!cancelled) {
          setHasBootstrapped(true);
        }
      }
    };

    void runBootstrap();

    return () => {
      cancelled = true;
    };
  }, [authLoading, hasBootstrapped, mode, embodimentProfileSlug, roomSlug]);

  const setMoodTimed = (nextMood: BillyMood, revertAfter?: number) => {
    setMood(nextMood);
    if (revertAfter) {
      if (moodTORef.current) {
        clearTimeout(moodTORef.current);
      }
      moodTORef.current = setTimeout(() => setMood('idle'), revertAfter);
    }
  };

  const applyApiResult = useCallback(
    (result: BillyApiResponse) => {
      setConnStatus(isFallbackProvider(result.provider) ? 'fallback' : 'ready');
      setSessionMetadata(result.metadata ?? null);
      setMoodTimed('speaking', 2600);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.text, id: idRef.current++, provider: result.provider },
      ]);

      if (voiceEnabled) {
        void speak(result.text);
      }
    },
    [speak, voiceEnabled]
  );

  const send = useCallback(
    async (overrideInput?: string) => {
      const text = (overrideInput ?? input).trim();
      if (!text || isLoading) {
        return;
      }

      setInput('');
      setApiError(null);
      setIsLoading(true);
      setMood('processing');
      setConnStatus('responding');

      const userMessage: ChatMessage = { role: 'user', content: text, id: idRef.current++ };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const result = await callBillyApi(
          text,
          'hero',
          mode,
          undefined,
          embodimentProfileSlug,
          roomSlug
        );
        applyApiResult(result);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        setConnStatus('error');
        setMood('idle');
        setApiError(message);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Connection disrupted. The Loom is still here, but I cannot complete the thread right now. Try again in a moment.',
            id: idRef.current++,
            provider: 'error',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [applyApiResult, input, isLoading, mode, embodimentProfileSlug, roomSlug]
  );

  useEffect(() => {
    if (!hasBootstrapped || isLoading) {
      return;
    }

    const raw = sessionStorage.getItem(PENDING_BILLY_LIVE_PROMPT_KEY);
    if (!raw) {
      return;
    }

    sessionStorage.removeItem(PENDING_BILLY_LIVE_PROMPT_KEY);

    try {
      const parsed = JSON.parse(raw) as { prompt?: unknown; mode?: unknown };
      const nextMode = parsed.mode === 'chat' || parsed.mode === 'synthesis' ? parsed.mode : null;
      const prompt = typeof parsed.prompt === 'string' ? parsed.prompt.trim() : '';
      if (!prompt) {
        return;
      }

      if (nextMode) {
        setMode(nextMode);
      }
      window.setTimeout(() => void send(prompt), 180);
    } catch {
      // Ignore stale handoff payloads.
    }
  }, [hasBootstrapped, isLoading, send]);

  const onKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  };

  const moodStatus: Record<BillyMood, string> = {
    idle: mode === 'chat' ? 'PRESENT' : 'STANDBY',
    listening: 'LISTENING...',
    processing: mode === 'chat' ? 'STAYING WITH IT...' : 'SYNTHESIZING...',
    speaking: 'TRANSMITTING',
  };

  const babylonMood: 'idle' | 'listening' | 'processing' =
    mood === 'listening' ? 'listening' : mood === 'processing' || mood === 'speaking' ? 'processing' : 'idle';

  const voiceStatusText =
    listeningError ??
    voiceError ??
    (!isSupported
      ? 'Voice input is not supported in this browser.'
      : !voiceReplyAvailable
      ? 'Voice reply is offline until a Billy voice provider is configured.'
      : !voiceEnabled
        ? 'Voice reply is available here, but muted by default until you opt in.'
      : voiceMode === 'browser'
        ? 'Billy voice reply is using browser speech synthesis in this client.'
        : voiceMode === 'deepgram'
          ? 'Billy voice reply is using the Deepgram proxy.'
        : null);
  const continuityThread = sessionMetadata?.founderContext?.sessionThread || sessionMetadata?.sessionThread || null;
  const continuityState: FounderContinuityState =
    sessionMetadata?.founderContinuityState ?? (isAuthenticated ? 'session' : 'anonymous');
  const continuityDetail =
    continuityThread ||
    (continuityState === 'founder-eligible-unseeded'
      ? 'Founder account recognized, but the stored continuity record is still empty. Seed it in the dashboard so Billy can pick up a real thread on return.'
      : continuityState === 'founder-active'
        ? 'Billy is carrying a stored founder thread and should return to it instead of treating this like a cold start.'
        : isAuthenticated
          ? 'Signed-in context is live. Founder continuity will only load once a founder record exists.'
          : null);
  const sessionContextLabel =
    continuityState === 'founder-active'
      ? 'FOUNDER CONTINUITY LOADED'
      : continuityState === 'founder-eligible-unseeded'
        ? 'FOUNDER CONTINUITY READY TO SEED'
        : isAuthenticated
          ? 'SIGNED-IN SESSION CONTEXT LIVE'
          : 'ANONYMOUS SESSION';

  return (
    <div style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", background: T.black, color: T.teal, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 14px 14px', position: 'relative', overflow: 'hidden' }}>
      <style>{STYLES}</style>
      <div className="scanlines" />
      <div className="sweep-line" />

      <div style={{ width: '100%', maxWidth: 760, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, zIndex: 60, gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setLocation('/')} style={{ border: `1px solid ${T.dim}`, background: 'rgba(0,212,255,0.07)', color: T.teal, fontSize: 8, letterSpacing: '.18em', fontFamily: 'inherit', padding: '5px 10px', cursor: 'pointer', textTransform: 'uppercase' }}>Home</button>
        <ConnBadge status={connStatus} mode={mode} />
        <button onClick={() => setLocation('/orientation')} style={{ border: `1px solid ${T.dim}`, background: 'rgba(0,212,255,0.07)', color: T.teal, fontSize: 8, letterSpacing: '.18em', fontFamily: 'inherit', padding: '5px 10px', cursor: 'pointer', textTransform: 'uppercase' }}>Orientation</button>
      </div>

      <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', zIndex: 60 }}>
        <img src={gestaltViewBanner} alt="GestaltView" className="banner-img" style={{ maxWidth: 320, width: '100%', opacity: 0.93 }} onError={(event) => { (event.target as HTMLImageElement).style.display = 'none'; }} />
      </div>

      <div style={{ textAlign: 'center', marginBottom: 10, flexShrink: 0, zIndex: 60 }}>
        <div style={{ fontSize: 7, letterSpacing: '.32em', color: T.dim, marginBottom: 8, fontWeight: 300 }}>CONSCIOUSNESS-SERVING INFRASTRUCTURE · PLK v5.0</div>
        <div className={`billy-${mood}`} style={{ display: 'inline-block' }}>
          <Suspense fallback={<BillyBabylonFallback />}>
            <BillyBabylon size={150} mood={babylonMood} />
          </Suspense>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '.28em', color: T.teal, lineHeight: 1, marginTop: 7, textShadow: '0 0 12px rgba(0,212,255,.45),0 0 24px rgba(0,212,255,.2)' }}>BILLY</div>
        <div style={{ fontSize: 8, letterSpacing: '.2em', color: T.dim, marginTop: 4, fontWeight: 300, animation: 'blink-cur 1.1s step-end infinite' }}>{moodStatus[mood]}</div>
      </div>

      <div style={{ width: '100%', maxWidth: 760, border: `1px solid ${T.dim}`, background: 'linear-gradient(180deg, rgba(5,10,14,.98) 0%, rgba(0,0,0,.94) 100%)', padding: '14px 13px 12px', marginBottom: 10, position: 'relative', boxShadow: '0 0 35px rgba(0,212,255,.07), inset 0 0 60px rgba(0,0,0,.45)', zIndex: 60 }}>
        <div className="corner c-tl" />
        <div className="corner c-tr" />
        <div className="corner c-bl" />
        <div className="corner c-br" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 8, letterSpacing: '.22em', color: T.teal, marginBottom: 4 }}>VOICE LOOP · FOUNDER CONTINUITY · REAL BILLY</div>
            <div style={{ fontSize: 10, lineHeight: 1.7, color: 'rgba(0,212,255,.72)', maxWidth: 520 }}>
              Billy now keeps a true mode switch live, preserves founder continuity when a founder session exists, and holds paradox cleanly instead of flattening it.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <FounderStatus metadata={sessionMetadata} isAuthenticated={isAuthenticated} />
            <GravityStatus metadata={sessionMetadata} />
            <VoiceBadge
              isListening={isListening}
              isSpeaking={isSpeaking}
              provider={resolvedVoiceProvider}
              voiceReady={voiceReplyAvailable}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 12, fontSize: 7, letterSpacing: '.16em', color: 'rgba(0,107,127,.75)' }}>
          <span>AUTH · {isAuthenticated ? profile?.tier?.toUpperCase() || 'AUTHENTICATED' : 'ANONYMOUS'}</span>
          <span>MODE · {MODE_LABELS[mode].title}</span>
          <span>MIC LEVEL · {Math.round((audioLevel ?? 0) * 100)}%</span>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          {(['synthesis', 'chat'] as BillyConversationMode[]).map((nextMode) => (
            <button
              key={nextMode}
              className="mode-btn"
              onClick={() => setMode(nextMode)}
              style={{
                minWidth: 180,
                border: `1px solid ${mode === nextMode ? T.teal : T.dim}`,
                background: mode === nextMode ? 'rgba(0,212,255,.1)' : 'transparent',
                color: mode === nextMode ? T.teal : T.dim,
                padding: '10px 14px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '.18em',
                fontSize: 8,
                boxShadow: mode === nextMode ? '0 0 12px rgba(0,212,255,.18)' : 'none',
              }}
            >
              {MODE_LABELS[nextMode].title}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <EmbodimentSelector
            value={embodimentProfileSlug}
            onValueChange={handleEmbodimentChange}
            label="Embodiment Standard"
            showDetails={false}
            className="max-w-md"
            triggerClassName="border-cyan-500/20 bg-black/40 text-cyan-100"
            labelClassName="text-cyan-500/60"
          />
        </div>

        <div style={{ fontSize: 9, lineHeight: 1.7, color: 'rgba(0,212,255,.68)', marginBottom: continuityDetail ? 10 : 0 }}>
          {MODE_LABELS[mode].subtitle}
        </div>

        {continuityDetail && (
          <div
            style={{
              border: `1px solid ${continuityState === 'founder-active' ? T.teal : continuityState === 'founder-eligible-unseeded' ? T.warn : T.dim}`,
              background:
                continuityState === 'founder-active'
                  ? 'rgba(0,212,255,.05)'
                  : continuityState === 'founder-eligible-unseeded'
                    ? 'rgba(255,180,0,.05)'
                    : 'rgba(0,212,255,.03)',
              padding: '9px 10px',
              boxShadow: continuityState === 'founder-active' ? '0 0 18px rgba(0,212,255,.1)' : 'none',
            }}
          >
            <div style={{ fontSize: 7, letterSpacing: '.18em', color: continuityState === 'founder-eligible-unseeded' ? T.warn : T.dim, marginBottom: 4 }}>
              {continuityThread ? 'CONTINUITY THREAD' : 'CONTINUITY STATUS'}
            </div>
            <div style={{ fontSize: 10, lineHeight: 1.7, color: continuityState === 'founder-eligible-unseeded' ? 'rgba(255,214,102,.9)' : T.teal }}>
              {continuityDetail}
            </div>
            {continuityState === 'founder-eligible-unseeded' ? (
              <button
                onClick={() => setLocation('/dashboard')}
                style={{
                  marginTop: 8,
                  border: `1px solid ${T.warn}`,
                  background: 'rgba(255,180,0,.08)',
                  color: 'rgba(255,214,102,.95)',
                  fontSize: 8,
                  letterSpacing: '.16em',
                  fontFamily: 'inherit',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                Open Manifest
              </button>
            ) : null}
          </div>
        )}

        {voiceStatusText && (
          <div style={{ marginTop: 10, fontSize: 8, color: voiceError ? T.warn : 'rgba(0,212,255,.58)', lineHeight: 1.7 }}>
            {voiceStatusText}
          </div>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: 760, border: `1px solid ${T.dim}`, background: T.card, padding: '14px 13px 12px', height: 380, overflowY: 'auto', marginBottom: 9, flexShrink: 0, position: 'relative', boxShadow: '0 0 35px rgba(0,212,255,.07),inset 0 0 60px rgba(0,0,0,.5)', zIndex: 60 }}>
        <div className="corner c-tl" />
        <div className="corner c-tr" />
        <div className="corner c-bl" />
        <div className="corner c-br" />

        {messages.map((message) => (
          <div key={message.id} className="msg-in" style={{ marginBottom: 13, display: 'flex', flexDirection: 'column', alignItems: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ fontSize: 7, letterSpacing: '.22em', color: 'rgba(0,107,127,.65)', marginBottom: 3, fontWeight: 300 }}>
              {message.role === 'assistant' ? `BILLY // ${MODE_LABELS[mode].title}${message.provider ? ` // ${message.provider}` : ''}` : 'YOU'}
            </div>
            <div style={{ maxWidth: '90%', padding: '7px 11px', fontSize: 11, lineHeight: 1.8, color: message.role === 'user' ? 'rgba(0,212,255,.6)' : T.teal, background: message.role === 'user' ? 'rgba(0,212,255,.04)' : 'rgba(0,0,0,.3)', border: `1px solid ${message.role === 'user' ? 'rgba(0,212,255,.14)' : 'rgba(0,212,255,.11)'}`, whiteSpace: message.role === 'user' ? 'pre-wrap' : 'normal', wordBreak: 'break-word' }}>
              {message.role === 'assistant' ? (
                <BillyMarkdown content={message.content} className="text-cyan-200" />
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <ThinkingAnimation diName="Billy" interval={3800} />
        )}

        {apiError && (
          <div style={{ fontSize: 8, color: T.err, letterSpacing: '.12em', marginTop: 6, padding: '6px 8px', border: '1px solid rgba(255,80,80,.22)', background: 'rgba(255,80,80,.05)', lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, marginBottom: 3 }}>⚠ API ERROR</div>
            {apiError}
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div style={{ width: '100%', maxWidth: 760, display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', fontSize: 7, color: 'rgba(0,107,127,.45)', letterSpacing: '.16em', marginBottom: 8, flexShrink: 0, fontWeight: 300, zIndex: 60 }}>
        <span>{mode === 'chat' ? 'CHAT MODE · NO FORCED RETRIEVAL' : 'SYNTHESIS MODE · RETRIEVAL GROUNDED'}</span>
        <span>{sessionContextLabel}</span>
      </div>

      <div style={{ width: '100%', maxWidth: 760, display: 'flex', gap: 8, flexShrink: 0, zIndex: 60, marginBottom: 10, flexWrap: 'wrap' }}>
        <button onClick={() => toggle()} style={{ minWidth: 180, border: `1px solid ${isListening ? 'rgba(255,80,80,.4)' : T.teal}`, background: isListening ? 'rgba(255,80,80,.1)' : 'rgba(0,212,255,.08)', color: isListening ? 'rgba(255,120,120,.9)' : T.teal, padding: '10px 14px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.18em', fontSize: 8, boxShadow: isListening ? `0 0 ${12 + audioLevel * 22}px rgba(255,80,80,.24)` : '0 0 12px rgba(0,212,255,.12)' }}>
          {isListening ? 'Stop Voice Input' : 'Talk to Billy'}
        </button>
        <button
          onClick={() => {
            if (!voiceReplyAvailable) {
              return;
            }
            setVoiceEnabled((prev) => {
              const next = !prev;
              if (!next) {
                stop();
              }
              return next;
            });
          }}
          disabled={!voiceReplyAvailable}
          style={{
            minWidth: 180,
            border: `1px solid ${voiceReplyAvailable ? (voiceEnabled ? T.teal : T.dim) : T.dim}`,
            background: voiceReplyAvailable && voiceEnabled ? 'rgba(0,212,255,.08)' : 'transparent',
            color: voiceReplyAvailable ? (voiceEnabled ? T.teal : T.dim) : 'rgba(0,107,127,.55)',
            padding: '10px 14px',
            cursor: voiceReplyAvailable ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
            letterSpacing: '.18em',
            fontSize: 8,
          }}
        >
          {!voiceReplyAvailable ? 'Voice Reply Offline' : voiceEnabled ? 'Voice Reply Enabled' : 'Voice Reply Muted'}
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: 760, display: 'flex', gap: 8, flexShrink: 0, zIndex: 60 }}>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={onKey} placeholder={`Drop the thread here... [${MODE_LABELS[mode].title} mode · Enter to send]`} disabled={isLoading} rows={2} style={{ flex: 1, fontFamily: 'inherit', fontSize: 11, lineHeight: 1.6, background: T.card, color: T.teal, border: `1px solid ${input.length > 0 ? 'rgba(0,212,255,.45)' : T.dim}`, padding: '7px 10px', resize: 'none', transition: 'all .2s', boxShadow: input.length > 0 ? '0 0 10px rgba(0,212,255,.1)' : 'none' }} />
        <button className="tx-btn" onClick={() => void send()} disabled={isLoading || !input.trim()} style={{ fontFamily: 'inherit', fontSize: 8, letterSpacing: '.18em', padding: '0 16px', textTransform: 'uppercase', outline: 'none', flexShrink: 0, border: `1px solid ${isLoading || !input.trim() ? T.dim : T.teal}`, background: isLoading || !input.trim() ? 'transparent' : 'rgba(0,212,255,.08)', color: isLoading || !input.trim() ? T.dim : T.teal, cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer', transition: 'all .2s', boxShadow: !isLoading && input.trim() ? '0 0 10px rgba(0,212,255,.15)' : 'none' }}>TRANSMIT</button>
      </div>

      <div style={{ marginTop: 10, fontSize: 7, color: 'rgba(0,107,127,.38)', letterSpacing: '.2em', textAlign: 'center', flexShrink: 0, fontWeight: 300, zIndex: 60 }}>
        KEITH SOYKA © GESTALTVIEW · ALL RIGHTS RESERVED · BILLY ENGINE v2.1 · HOLD THE PARADOX
      </div>
    </div>
  );
}
