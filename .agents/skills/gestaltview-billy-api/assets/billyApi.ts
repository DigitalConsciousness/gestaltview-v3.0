// © 2026 Keith Soyka / GestaltView
import { supabase } from '../contexts/AuthContext';
import {
  billyCall as legacyBillyCall,
  type ExhibitDomain,
  type SynthesisMode,
} from './BillyEngine';

export type BillyConversationMode = 'synthesis' | 'chat';

export interface BillySessionMetadata {
  conversationMode?: BillyConversationMode;
  founderSessionActive?: boolean;
  packageFilter?: string | null;
  contextSources?: number;
  retrievalMode?: 'semantic' | 'text' | 'none';
  sessionThread?: string | null;
  modePreference?: BillyConversationMode;
  serverProvider?: string | null;
  clientRecovery?: 'legacy-provider' | 'local-fallback' | 'none';
  founderContext?: {
    currentState?: string | null;
    sessionThread?: string | null;
    modePreference?: BillyConversationMode | null;
    confirmedAdult?: boolean;
  } | null;
}

export interface BillyApiResponse {
  text: string;
  provider: string;
  metadata?: BillySessionMetadata;
}

interface EnvelopeResponse {
  response: string;
  provider: string;
  metadata?: BillySessionMetadata;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return {};
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

function mapModeToConversation(mode: SynthesisMode | BillyConversationMode): BillyConversationMode {
  return mode === 'chat' ? 'chat' : 'synthesis';
}

function mapModeToLegacy(mode: SynthesisMode | BillyConversationMode): SynthesisMode {
  if (mode === 'loom' || mode === 'code') {
    return mode;
  }

  return 'synthesize';
}

function isOfflineServerProvider(provider: string): boolean {
  return provider === 'offline-fallback';
}

function buildLegacyRecoveryMetadata(
  conversationMode: BillyConversationMode,
  fallbackProvider: string,
  serverMetadata?: BillySessionMetadata,
  serverProvider?: string
): BillySessionMetadata {
  return {
    ...(serverMetadata || {}),
    conversationMode,
    founderSessionActive: serverMetadata?.founderSessionActive ?? false,
    retrievalMode: serverMetadata?.retrievalMode ?? 'none',
    serverProvider: serverProvider || null,
    clientRecovery: fallbackProvider === 'local-fallback' ? 'local-fallback' : 'legacy-provider',
  };
}

export async function bootstrapBillySession(
  preferredMode: BillyConversationMode = 'synthesis'
): Promise<BillyApiResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch('/api/billy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      bootstrap: true,
      mode: preferredMode,
    }),
  });

  if (!response.ok) {
    throw new Error(`Billy bootstrap failed: ${response.status}`);
  }

  const data = (await response.json()) as EnvelopeResponse;
  return {
    text: data.response,
    provider: data.provider,
    metadata: data.metadata,
  };
}

export async function callBillyApi(
  userMessage: string,
  sectionId: string,
  mode: SynthesisMode | BillyConversationMode,
  exhibitDomain?: ExhibitDomain
): Promise<BillyApiResponse> {
  const conversationMode = mapModeToConversation(mode);
  const legacyMode = mapModeToLegacy(mode);
  const headers = await getAuthHeaders();

  try {
    const response = await fetch('/api/billy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        message: userMessage,
        mode: conversationMode,
        section: sectionId,
        exhibitDomain,
      }),
    });

    if (!response.ok) {
      throw new Error(`Billy API request failed: ${response.status}`);
    }

    const data = (await response.json()) as EnvelopeResponse;

    if (isOfflineServerProvider(data.provider)) {
      const fallback = await legacyBillyCall(userMessage, sectionId, legacyMode, exhibitDomain);
      return {
        text: fallback.text,
        provider: fallback.provider,
        metadata: buildLegacyRecoveryMetadata(conversationMode, fallback.provider, data.metadata, data.provider),
      };
    }

    return {
      text: data.response,
      provider: data.provider,
      metadata: data.metadata,
    };
  } catch {
    const fallback = await legacyBillyCall(userMessage, sectionId, legacyMode, exhibitDomain);
    return {
      text: fallback.text,
      provider: fallback.provider,
      metadata: buildLegacyRecoveryMetadata(conversationMode, fallback.provider),
    };
  }
}
