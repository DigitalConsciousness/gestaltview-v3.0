import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  Brain,
  Crown,
  KeyRound,
  Loader2,
  Mic,
  PlusCircle,
  RefreshCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

import NavBar from "@/components/NavBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { getRuntimeArtifactCounts } from "@/lib/artifact";
import { buildDashboardOverview, type DashboardOverview } from "@/lib/dashboardOverview";
import { PAGE_SEO, useSEO } from "@/hooks/useSEO";
import {
  countFounderContextOutbox,
  flushFounderContextOutbox,
  queueFounderContextWrite,
  type FounderContextOutboxPayload,
} from "@/lib/founderContextOutbox";
import { cn } from "@/lib/utils";
import { PackagingGatePanel } from "@/features/agent-trainer/PackagingGatePanel";
import { OrchestrationAnalyticsPanel } from "@/components/admin/OrchestrationAnalyticsPanel";
import { useTrainerGovernance } from "@/features/agent-trainer/hooks/useTrainerGovernance";
import { WorkbookSyncPanel } from "@/features/workbook/WorkbookSyncPanel";

type DashboardProfile = {
  id: string;
  email: string;
  tier: "free" | "core" | "pro" | "enterprise";
  subscriptionStatus: string;
  billingPeriodStart: string | null;
  billyQueryCount: number;
  isAdmin: boolean;
  graceUntil: string | null;
  createdAt: string;
  updatedAt: string;
};

type DashboardUser = DashboardProfile;

type DashboardPayload = {
  profile: DashboardProfile;
  controls: {
    founderBootstrapEligible: boolean;
    founderControlActive: boolean;
    canAccessAdminTools: boolean;
    adminSeedHint: string | null;
  };
  founderContext: {
    currentState: string;
    sessionThread: string;
    modePreference: "synthesis" | "chat";
    confirmedAdult: boolean;
    plkSnapshot: Record<string, unknown>;
    lastSessionAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  shortcuts: {
    billy: string;
    billyVoiceStudio: string;
    trainer: string;
    metrics: string;
    pricing: string;
  };
  billyRuntime: {
    liveConsolePath: string;
    voiceStudioPath: string;
    textApiPath: string;
    voiceApiPath: string;
    healthApiPath: string;
    textProviders: {
      groq: boolean;
      openai: boolean;
      openRouter: boolean;
      gemini: boolean;
      huggingFace: boolean;
    };
    voiceStack: {
      deepgram: boolean;
      liveKit: boolean;
      voiceProfile: boolean;
      billyWorker: boolean;
    };
  };
  voiceProfile: VoiceProfilePayload;
  adminUsers: DashboardUser[];
};

type FounderFormState = {
  currentState: string;
  sessionThread: string;
  modePreference: "synthesis" | "chat";
  confirmedAdult: boolean;
  plkSnapshotText: string;
};

type FounderSyncState = "idle" | "syncing" | "synced" | "failed";

type AdminUserFormState = {
  tier: DashboardUser["tier"];
  subscriptionStatus: string;
  isAdmin: boolean;
  graceUntilInput: string;
  billingPeriodStartInput: string;
};

type DashboardMemoryEntry = {
  id: string;
  user_id: string;
  scope: "personal" | "session" | "shared";
  kind: "identity" | "preference" | "goal" | "project" | "relationship" | "constraint" | "insight" | "note";
  title: string | null;
  summary: string | null;
  content: string;
  content_hash: string;
  source: string;
  source_ref: string | null;
  tags: string[] | null;
  metadata: Record<string, unknown>;
  importance: number;
  pinned: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type MemoryFormState = {
  id: string | null;
  title: string;
  summary: string;
  content: string;
  kind: DashboardMemoryEntry["kind"];
  scope: DashboardMemoryEntry["scope"];
  tagsText: string;
  importance: "1" | "2" | "3" | "4" | "5";
  pinned: boolean;
};

type BillyHealthPayload = {
  ok: boolean;
  timestamp: string;
  supabase?: {
    ok?: boolean;
  };
  rpc?: {
    ok?: boolean;
    details?: string;
  };
  llm?: Record<string, unknown>;
};

type BillySmokePayload = {
  response: string;
  provider: string;
};

type DashboardSandboxChunk = {
  document_id: string;
  chunk_index: number;
  score: number | null;
  filename: string;
  document_type: string | null;
};

type DashboardSandboxPayload = {
  response: string;
  provider: string;
  timestamp?: string;
  tokensUsed?: number | null;
  processingTime?: number;
  metadata?: Record<string, unknown>;
  chunks?: DashboardSandboxChunk[];
};

type VoiceProfilePayload = {
  id: string;
  profile_slug: string;
  display_name: string;
  provider_preference: "local" | "hf" | "elevenlabs" | "browser" | "deepgram";
  tts_model: string | null;
  stt_model: string | null;
  speaker_id: string | null;
  style_preset: Record<string, unknown>;
  fallback_text_only: boolean;
  consent_notes: string | null;
  provider_config: Record<string, unknown>;
  review_status: "proposed" | "auditioned" | "approved" | "rejected";
  last_auditioned_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

type VoiceProfileFormState = {
  profileSlug: string;
  displayName: string;
  providerPreference: VoiceProfilePayload["provider_preference"];
  ttsModel: string;
  sttModel: string;
  speakerId: string;
  stylePresetText: string;
  fallbackTextOnly: boolean;
  consentNotes: string;
  providerConfigText: string;
  reviewStatus: VoiceProfilePayload["review_status"];
  lastAuditionedAt: string;
  approvedAt: string;
};

const EMPTY_FOUNDER_FORM: FounderFormState = {
  currentState: "",
  sessionThread: "",
  modePreference: "synthesis",
  confirmedAdult: false,
  plkSnapshotText: "{}",
};

const EMPTY_MEMORY_FORM: MemoryFormState = {
  id: null,
  title: "",
  summary: "",
  content: "",
  kind: "note",
  scope: "personal",
  tagsText: "",
  importance: "3",
  pinned: false,
};

const EMPTY_VOICE_PROFILE_FORM: VoiceProfileFormState = {
  profileSlug: "billy",
  displayName: "Billy",
  providerPreference: "deepgram",
  ttsModel: "aura-2-aries-en",
  sttModel: "nova-3",
  speakerId: "aries",
  stylePresetText: JSON.stringify(
    { warmth: 0.75, pace: 0.98, humor: 0.25, energy: 0.55, clarity: 0.92 },
    null,
    2
  ),
  fallbackTextOnly: true,
  consentNotes:
    "Stock voice assignment only. Never clone or impersonate a named human reference from the embodiment profile.",
  providerConfigText: JSON.stringify(
    { speed: 0.98, live_stt_model: "flux-general-en", greeting: "Hey. Good to hear you. What's on your mind?" },
    null,
    2
  ),
  reviewStatus: "proposed",
  lastAuditionedAt: "",
  approvedAt: "",
};

const SUBSCRIPTION_OPTIONS = ["inactive", "active", "trialing", "past_due", "canceled"] as const;
const MEMORY_KIND_OPTIONS: Array<{ value: MemoryFormState["kind"]; label: string }> = [
  { value: "identity", label: "Identity" },
  { value: "preference", label: "Preference" },
  { value: "goal", label: "Goal" },
  { value: "project", label: "Project" },
  { value: "relationship", label: "Relationship" },
  { value: "constraint", label: "Constraint" },
  { value: "insight", label: "Insight" },
  { value: "note", label: "Note" },
];
const MEMORY_SCOPE_OPTIONS: Array<{ value: MemoryFormState["scope"]; label: string }> = [
  { value: "personal", label: "Personal" },
  { value: "session", label: "Session" },
  { value: "shared", label: "Shared" },
];
const MEMORY_IMPORTANCE_OPTIONS: MemoryFormState["importance"][] = ["1", "2", "3", "4", "5"];

function formatDate(value: string | null): string {
  if (!value) return "Not set";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatDateTimeInputValue(value: string | null): string {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const localValue = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60_000);
  return localValue.toISOString().slice(0, 16);
}

function createFounderFormState(payload: DashboardPayload["founderContext"]): FounderFormState {
  if (!payload) return EMPTY_FOUNDER_FORM;

  return {
    currentState: payload.currentState ?? "",
    sessionThread: payload.sessionThread ?? "",
    modePreference: payload.modePreference ?? "synthesis",
    confirmedAdult: payload.confirmedAdult ?? false,
    plkSnapshotText: JSON.stringify(payload.plkSnapshot ?? {}, null, 2),
  };
}

function createVoiceProfileFormState(payload: DashboardPayload["voiceProfile"] | null): VoiceProfileFormState {
  if (!payload) {
    return EMPTY_VOICE_PROFILE_FORM;
  }

  return {
    profileSlug: payload.profile_slug || EMPTY_VOICE_PROFILE_FORM.profileSlug,
    displayName: payload.display_name || EMPTY_VOICE_PROFILE_FORM.displayName,
    providerPreference: payload.provider_preference,
    ttsModel: payload.tts_model || "",
    sttModel: payload.stt_model || "",
    speakerId: payload.speaker_id || "",
    stylePresetText: JSON.stringify(payload.style_preset ?? {}, null, 2),
    fallbackTextOnly: payload.fallback_text_only,
    consentNotes: payload.consent_notes || "",
    providerConfigText: JSON.stringify(payload.provider_config ?? {}, null, 2),
    reviewStatus: payload.review_status,
    lastAuditionedAt: payload.last_auditioned_at ? payload.last_auditioned_at.slice(0, 16) : "",
    approvedAt: payload.approved_at ? payload.approved_at.slice(0, 16) : "",
  };
}

function createAdminUserFormState(user: DashboardUser): AdminUserFormState {
  return {
    tier: user.tier,
    subscriptionStatus: user.subscriptionStatus || "inactive",
    isAdmin: user.isAdmin,
    graceUntilInput: formatDateTimeInputValue(user.graceUntil),
    billingPeriodStartInput: formatDateTimeInputValue(user.billingPeriodStart),
  };
}

function createMemoryFormState(memory: DashboardMemoryEntry | null): MemoryFormState {
  if (!memory) return EMPTY_MEMORY_FORM;

  return {
    id: memory.id,
    title: memory.title ?? "",
    summary: memory.summary ?? "",
    content: memory.content,
    kind: memory.kind,
    scope: memory.scope,
    tagsText: (memory.tags ?? []).join(", "),
    importance: String(memory.importance) as MemoryFormState["importance"],
    pinned: memory.pinned,
  };
}

function trimPreview(value: string, maxLength = 180): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1))}…`;
}

function getConfiguredLlmProviders(value: BillyHealthPayload["llm"]): string[] {
  if (!value || typeof value !== "object") return [];

  return Object.entries(value).flatMap(([provider, details]) => {
    if (!details || typeof details !== "object") {
      return [];
    }

    return "configured" in details && details.configured === true ? [provider] : [];
  });
}

export default function DashboardPage() {
  useSEO(PAGE_SEO.dashboard);
  const {
    isAuthenticated,
    isLoading: authLoading,
    session,
    getAuthHeader,
    refreshProfile,
    signOut,
  } = useAuth();
  const hasAuthToken = Boolean(session?.access_token);

  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [founderForm, setFounderForm] = useState<FounderFormState>(EMPTY_FOUNDER_FORM);
  const [voiceProfileForm, setVoiceProfileForm] = useState<VoiceProfileFormState>(EMPTY_VOICE_PROFILE_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [smokeLoading, setSmokeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [voiceProfileSaving, setVoiceProfileSaving] = useState(false);
  const [voiceProfileTesting, setVoiceProfileTesting] = useState(false);
  const [voiceProfileError, setVoiceProfileError] = useState<string | null>(null);
  const [voiceProfileNotice, setVoiceProfileNotice] = useState<string | null>(null);
  const [pendingFounderWrites, setPendingFounderWrites] = useState(0);
  const [founderSyncState, setFounderSyncState] = useState<FounderSyncState>("idle");
  const [lastFounderSyncAt, setLastFounderSyncAt] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [smokeError, setSmokeError] = useState<string | null>(null);
  const [healthSnapshot, setHealthSnapshot] = useState<BillyHealthPayload | null>(null);
  const [smokeResult, setSmokeResult] = useState<BillySmokePayload | null>(null);
  const [sandboxPrompt, setSandboxPrompt] = useState(
    "Use this sandbox to test Billy behavior, runtime routing, and retrieval context without affecting the public surfaces."
  );
  const [sandboxMode, setSandboxMode] = useState<"chat" | "synthesis">("chat");
  const [sandboxSection, setSandboxSection] = useState("manifest-playground");
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxError, setSandboxError] = useState<string | null>(null);
  const [sandboxResult, setSandboxResult] = useState<DashboardSandboxPayload | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [adminUserForm, setAdminUserForm] = useState<AdminUserFormState | null>(null);
  const [memoryEntries, setMemoryEntries] = useState<DashboardMemoryEntry[]>([]);
  const [memoryFilter, setMemoryFilter] = useState("");
  const [memoryForm, setMemoryForm] = useState<MemoryFormState>(EMPTY_MEMORY_FORM);
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [memorySaving, setMemorySaving] = useState(false);
  const [memoryDeletingId, setMemoryDeletingId] = useState<string | null>(null);
  const [memoryError, setMemoryError] = useState<string | null>(null);
  const [memoryNotice, setMemoryNotice] = useState<string | null>(null);
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const runtimeArtifactCounts = getRuntimeArtifactCounts();
  const governance = useTrainerGovernance({
    authHeaders: getAuthHeader(),
    enabled:
      hasAuthToken &&
      isAuthenticated &&
      Boolean(dashboard?.controls.founderControlActive && dashboard?.profile.isAdmin),
  });

  const applyDashboardPayload = useCallback((payload: DashboardPayload) => {
    setDashboard(payload);
    setFounderForm(createFounderFormState(payload.founderContext));
    setVoiceProfileForm(createVoiceProfileFormState(payload.voiceProfile));
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/session/dashboard", {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || `Manifest request failed: ${response.status}`);
      }

      applyDashboardPayload((await response.json()) as DashboardPayload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    } finally {
      setLoading(false);
    }
  }, [applyDashboardPayload, getAuthHeader]);

  const refreshPendingFounderWrites = useCallback(async () => {
    try {
      setPendingFounderWrites(await countFounderContextOutbox());
    } catch {
      setPendingFounderWrites(0);
    }
  }, []);

  const flushPendingFounderWrites = useCallback(async () => {
    if (!hasAuthToken) {
      return;
    }

    let pendingBeforeFlush = 0;
    try {
      pendingBeforeFlush = await countFounderContextOutbox();
    } catch {
      pendingBeforeFlush = 0;
    }
    setPendingFounderWrites(pendingBeforeFlush);

    if (pendingBeforeFlush === 0) {
      setFounderSyncState("idle");
      return;
    }

    setFounderSyncState("syncing");
    setNotice("Syncing locally saved founder context...");

    try {
      let lastFailureReason = "";
      const result = await flushFounderContextOutbox(async (entry) => {
        const response = await fetch("/api/session/dashboard", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            ...entry.payload,
            idempotencyKey: entry.idempotencyKey,
          }),
        });

        if (response.ok) {
          return true;
        }

        const payload = (await response.json().catch(() => null)) as { error?: string; reason?: string } | null;
        lastFailureReason = payload?.error ?? payload?.reason ?? `HTTP ${response.status}`;
        return false;
      });

      setPendingFounderWrites(result.remaining);
      if (result.synced > 0) {
        setFounderSyncState("synced");
        setLastFounderSyncAt(new Date().toISOString());
        setNotice(`Synced ${result.synced} locally saved founder update${result.synced === 1 ? "" : "s"}.`);
        await loadDashboard();
      } else if (result.remaining > 0) {
        setFounderSyncState("failed");
        setNotice(null);
        setError(
          lastFailureReason
            ? `Founder context sync paused. Pending local updates could not be persisted yet. ${lastFailureReason}`
            : "Founder context sync paused. Pending local updates could not be persisted yet.",
        );
      } else {
        setFounderSyncState("synced");
        setLastFounderSyncAt(new Date().toISOString());
        setNotice("Founder context sync checked. No pending local updates remained.");
      }
    } catch (syncError) {
      setFounderSyncState("failed");
      setNotice(null);
      setError(syncError instanceof Error ? syncError.message : "Founder context sync failed.");
      await refreshPendingFounderWrites();
    }
  }, [getAuthHeader, hasAuthToken, loadDashboard, refreshPendingFounderWrites]);

  const loadMemoryEntries = useCallback(async () => {
    setMemoryLoading(true);
    setMemoryError(null);

    try {
      const response = await fetch("/api/session/memory?limit=24", {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      const payload = (await response.json().catch(() => null)) as
        | { memories?: DashboardMemoryEntry[]; error?: string }
        | null;

      if (!response.ok || !payload || !Array.isArray(payload.memories)) {
        throw new Error(payload?.error || `Memory request failed: ${response.status}`);
      }

      setMemoryEntries(payload.memories);
    } catch (loadError) {
      setMemoryError(loadError instanceof Error ? loadError.message : String(loadError));
    } finally {
      setMemoryLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    if (authLoading || (isAuthenticated && !hasAuthToken)) {
      return;
    }

    if (!isAuthenticated || !hasAuthToken) {
      setLoading(false);
      return;
    }

    void loadDashboard();
  }, [authLoading, hasAuthToken, isAuthenticated, loadDashboard]);

  useEffect(() => {
    void refreshPendingFounderWrites();
  }, [refreshPendingFounderWrites]);

  useEffect(() => {
    if (!hasAuthToken) {
      return;
    }

    void flushPendingFounderWrites();
    window.addEventListener("online", flushPendingFounderWrites);
    return () => window.removeEventListener("online", flushPendingFounderWrites);
  }, [flushPendingFounderWrites, hasAuthToken]);

  useEffect(() => {
    if (authLoading || (isAuthenticated && !hasAuthToken)) {
      return;
    }

    if (!isAuthenticated || !hasAuthToken) {
      setMemoryEntries([]);
      setMemoryForm(EMPTY_MEMORY_FORM);
      setEditingMemoryId(null);
      return;
    }

    void loadMemoryEntries();
  }, [authLoading, hasAuthToken, isAuthenticated, loadMemoryEntries]);

  const shortcutCards = useMemo(() => {
    if (!dashboard) return [];

    return [
      { href: "/orientation", label: "Orientation", detail: "Public runtime front door and Billy launch context." },
      { href: "/founder-runtime", label: "Founder Runtime", detail: "Founder entry point for the live environment and admin control plane." },
      { href: dashboard.shortcuts.billy, label: "Billy Live", detail: "Primary Billy interface and founder continuity lane." },
      {
        href: dashboard.shortcuts.billyVoiceStudio,
        label: "Billy Voice Studio",
        detail: "The secret TSX voice room with mic input, text-loop inspection, and runtime staging.",
      },
      { href: dashboard.shortcuts.metrics, label: "Metrics", detail: "Operational telemetry and narrative performance surfaces." },
      { href: dashboard.shortcuts.pricing, label: "Pricing", detail: "Commercial state, tier presentation, and upgrade funnel." },
      ...(dashboard.controls.founderControlActive
        ? [{ href: dashboard.shortcuts.trainer, label: "Agent Trainer", detail: "Founder/admin agent evaluation and deployment tooling." }]
        : []),
    ];
  }, [dashboard]);

  const billyRuntimeChecks = useMemo(() => {
    if (!dashboard) return [];

    return [
      { label: "Groq", configured: dashboard.billyRuntime.textProviders.groq },
      { label: "OpenAI", configured: dashboard.billyRuntime.textProviders.openai },
      { label: "OpenRouter", configured: dashboard.billyRuntime.textProviders.openRouter },
      { label: "Gemini", configured: dashboard.billyRuntime.textProviders.gemini },
      { label: "Hugging Face", configured: dashboard.billyRuntime.textProviders.huggingFace },
      { label: "Deepgram", configured: dashboard.billyRuntime.voiceStack.deepgram },
      { label: "LiveKit", configured: dashboard.billyRuntime.voiceStack.liveKit },
      { label: "Voice Profile", configured: dashboard.billyRuntime.voiceStack.voiceProfile },
      { label: "Billy Worker URL", configured: dashboard.billyRuntime.voiceStack.billyWorker },
    ];
  }, [dashboard]);

  const filteredAdminUsers = useMemo(() => {
    const users = dashboard?.adminUsers ?? [];
    const query = userFilter.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => {
      const haystack = [
        user.email,
        user.tier,
        user.subscriptionStatus,
        user.isAdmin ? "admin" : "member",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [dashboard, userFilter]);

  const selectedAdminUser = useMemo(
    () => dashboard?.adminUsers.find((user) => user.id === selectedUserId) ?? null,
    [dashboard, selectedUserId]
  );

  const filteredMemoryEntries = useMemo(() => {
    const query = memoryFilter.trim().toLowerCase();
    if (!query) return memoryEntries;

    return memoryEntries.filter((memory) =>
      [
        memory.title ?? "",
        memory.summary ?? "",
        memory.content,
        memory.kind,
        memory.scope,
        ...(memory.tags ?? []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [memoryEntries, memoryFilter]);

  const showGovernanceTabs = Boolean(
    dashboard?.controls.founderControlActive && dashboard?.profile.isAdmin
  );

  const dashboardOverview = useMemo<DashboardOverview | null>(() => {
    if (!dashboard) {
      return null;
    }

    const activeModules = shortcutCards.length + (showGovernanceTabs ? 3 : 0);
    return buildDashboardOverview({
      email: dashboard.profile.email,
      displayName: dashboard.profile.email.split("@")[0] ?? "",
      memoryEntries,
      runtimeArtifactCounts,
      activeModuleCount: activeModules,
      founderLastSessionAt: dashboard.founderContext?.lastSessionAt ?? null,
    });
  }, [dashboard, memoryEntries, runtimeArtifactCounts, shortcutCards.length, showGovernanceTabs]);

  useEffect(() => {
    const users = dashboard?.adminUsers ?? [];
    if (users.length === 0) {
      setSelectedUserId("");
      return;
    }

    setSelectedUserId((current) => {
      if (current && users.some((user) => user.id === current)) {
        return current;
      }

      const currentAccount = users.find((user) => user.id === dashboard?.profile.id);
      return currentAccount?.id ?? users[0].id;
    });
  }, [dashboard]);

  useEffect(() => {
    setAdminUserForm(selectedAdminUser ? createAdminUserFormState(selectedAdminUser) : null);
  }, [selectedAdminUser]);

  useEffect(() => {
    if (!editingMemoryId) {
      return;
    }

    const matchingMemory = memoryEntries.find((memory) => memory.id === editingMemoryId);
    if (!matchingMemory) {
      setEditingMemoryId(null);
      setMemoryForm(EMPTY_MEMORY_FORM);
      return;
    }

    setMemoryForm(createMemoryFormState(matchingMemory));
  }, [editingMemoryId, memoryEntries]);

  async function handleActivateFounderAdmin() {
    setBootstrapping(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/session/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ action: "bootstrap-founder-admin" }),
      });

      const payload = (await response.json().catch(() => null)) as DashboardPayload | { error?: string } | null;
      if (!response.ok || !payload || !("profile" in payload)) {
        throw new Error((payload as { error?: string } | null)?.error || "Founder admin activation failed.");
      }

      applyDashboardPayload(payload);
      void refreshProfile();
      setNotice("Founder admin is active. Internal control surfaces are unlocked.");
    } catch (bootstrapError) {
      setError(bootstrapError instanceof Error ? bootstrapError.message : String(bootstrapError));
    } finally {
      setBootstrapping(false);
    }
  }

  async function handleSaveFounderContext() {
    setSaving(true);
    setError(null);
    setNotice(null);

    let payload: FounderContextOutboxPayload;
    try {
      const plkSnapshot = JSON.parse(founderForm.plkSnapshotText || "{}") as Record<string, unknown>;
      payload = {
        currentState: founderForm.currentState,
        sessionThread: founderForm.sessionThread,
        modePreference: founderForm.modePreference,
        confirmedAdult: founderForm.confirmedAdult,
        plkSnapshot,
      };
    } catch {
      setError("PLK snapshot must be valid JSON.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/session/dashboard", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          ...payload,
          idempotencyKey:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `founder-context-${Date.now()}`,
        }),
      });

      const responsePayload = (await response.json().catch(() => null)) as DashboardPayload | { error?: string } | null;
      if (!response.ok || !responsePayload || !("profile" in responsePayload)) {
        throw new Error((responsePayload as { error?: string } | null)?.error || "Founder persistence save failed.");
      }

      applyDashboardPayload(responsePayload);
      setFounderSyncState("synced");
      setLastFounderSyncAt(new Date().toISOString());
      setNotice("Founder persistence saved.");
    } catch (saveError) {
      try {
        await queueFounderContextWrite(payload);
        await refreshPendingFounderWrites();
        setFounderSyncState("idle");
        setNotice("Founder persistence saved locally, pending sync.");
      } catch {
        const message = saveError instanceof Error ? saveError.message : String(saveError);
        setError(message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveUserAccount() {
    if (!selectedAdminUser || !adminUserForm) {
      return;
    }

    setSavingUser(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/session/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          action: "update-user-account",
          targetUserId: selectedAdminUser.id,
          tier: adminUserForm.tier,
          subscriptionStatus: adminUserForm.subscriptionStatus,
          isAdmin: adminUserForm.isAdmin,
          graceUntil: adminUserForm.graceUntilInput || null,
          billingPeriodStart: adminUserForm.billingPeriodStartInput || null,
        }),
      });

      const payload = (await response.json().catch(() => null)) as DashboardPayload | { error?: string } | null;
      if (!response.ok || !payload || !("profile" in payload)) {
        throw new Error((payload as { error?: string } | null)?.error || "User account update failed.");
      }

      applyDashboardPayload(payload);
      if (selectedAdminUser.id === dashboard?.profile.id) {
        void refreshProfile();
      }
      setNotice(`Saved overrides for ${selectedAdminUser.email}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      setSavingUser(false);
    }
  }

  async function handleRunHealthCheck() {
    if (!dashboard) return;

    setHealthLoading(true);
    setHealthError(null);

    try {
      const response = await fetch(dashboard.billyRuntime.healthApiPath);
      const payload = (await response.json().catch(() => null)) as BillyHealthPayload | { error?: string } | null;
      if (!payload || !("ok" in payload)) {
        throw new Error((payload as { error?: string } | null)?.error || "Billy health payload was invalid.");
      }

      setHealthSnapshot(payload);
    } catch (healthCheckError) {
      setHealthError(healthCheckError instanceof Error ? healthCheckError.message : String(healthCheckError));
    } finally {
      setHealthLoading(false);
    }
  }

  async function handleRunBillySmoke() {
    if (!dashboard) return;

    setSmokeLoading(true);
    setSmokeError(null);
    setSmokeResult(null);

    try {
      const response = await fetch(dashboard.billyRuntime.textApiPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          message: "Reply with a short Billy confirmation that the manifest smoke path is online.",
          mode: "chat",
          section: "manifest-smoke",
        }),
      });

      const payload = (await response.json().catch(() => null)) as BillySmokePayload | { error?: string } | null;
      if (!response.ok || !payload || !("response" in payload)) {
        throw new Error((payload as { error?: string } | null)?.error || `Billy smoke test failed: ${response.status}`);
      }

      setSmokeResult(payload);
    } catch (smokeTestError) {
      setSmokeError(smokeTestError instanceof Error ? smokeTestError.message : String(smokeTestError));
    } finally {
      setSmokeLoading(false);
    }
  }

  async function handleSaveVoiceProfile() {
    if (!dashboard) {
      return;
    }

    setVoiceProfileSaving(true);
    setVoiceProfileError(null);
    setVoiceProfileNotice(null);
    setError(null);

    try {
      const parsedStylePreset = JSON.parse(voiceProfileForm.stylePresetText || "{}") as Record<string, unknown>;
      const parsedProviderConfig = JSON.parse(
        voiceProfileForm.providerConfigText || "{}"
      ) as Record<string, unknown>;

      const response = await fetch("/api/session/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          action: "update-voice-profile",
          profileSlug: voiceProfileForm.profileSlug,
          displayName: voiceProfileForm.displayName,
          providerPreference: voiceProfileForm.providerPreference,
          ttsModel: voiceProfileForm.ttsModel || null,
          sttModel: voiceProfileForm.sttModel || null,
          speakerId: voiceProfileForm.speakerId || null,
          stylePreset: parsedStylePreset,
          fallbackTextOnly: voiceProfileForm.fallbackTextOnly,
          consentNotes: voiceProfileForm.consentNotes || null,
          providerConfig: parsedProviderConfig,
          reviewStatus: voiceProfileForm.reviewStatus,
          lastAuditionedAt: voiceProfileForm.lastAuditionedAt || null,
          approvedAt: voiceProfileForm.approvedAt || null,
        }),
      });

      const payload = (await response.json().catch(() => null)) as DashboardPayload | { error?: string } | null;
      if (!response.ok || !payload || !("profile" in payload)) {
        throw new Error((payload as { error?: string } | null)?.error || "Voice profile update failed.");
      }

      applyDashboardPayload(payload);
      setVoiceProfileNotice("Voice profile saved.");
      setNotice("Voice profile saved to the runtime manifest.");
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : String(saveError);
      setVoiceProfileError(message);
      setError(message);
    } finally {
      setVoiceProfileSaving(false);
    }
  }

  async function handleTestVoiceProfile() {
    if (!dashboard) {
      return;
    }

    setVoiceProfileTesting(true);
    setVoiceProfileError(null);
    setVoiceProfileNotice(null);
    setError(null);
    let audioUrl: string | null = null;

    try {
      const response = await fetch(dashboard.billyRuntime.voiceApiPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          text: `Billy voice profile test for ${voiceProfileForm.displayName}. This is a runtime audition from the dashboard.`,
          profileSlug: voiceProfileForm.profileSlug,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || `Voice test failed with status ${response.status}.`);
      }

      const audioBlob = await response.blob();
      audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Unable to play the voice audition."));
        void audio.play().catch((playError: unknown) => {
          reject(playError instanceof Error ? playError : new Error(String(playError)));
        });
      });
      setVoiceProfileForm((current) => ({
        ...current,
        lastAuditionedAt: new Date().toISOString().slice(0, 16),
      }));
      setVoiceProfileNotice("Voice audition completed.");
    } catch (testError) {
      const message = testError instanceof Error ? testError.message : String(testError);
      setVoiceProfileError(message);
      setError(message);
    } finally {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setVoiceProfileTesting(false);
    }
  }

  async function handleRunSandboxPrompt() {
    if (!dashboard || !sandboxPrompt.trim()) {
      return;
    }

    setSandboxLoading(true);
    setSandboxError(null);
    setSandboxResult(null);

    try {
      const response = await fetch(dashboard.billyRuntime.textApiPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          message: sandboxPrompt,
          mode: sandboxMode,
          section: sandboxSection.trim() || "manifest-playground",
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | DashboardSandboxPayload
        | { error?: string }
        | null;

      if (!response.ok || !payload || !("response" in payload)) {
        throw new Error((payload as { error?: string } | null)?.error || `Sandbox request failed: ${response.status}`);
      }

      setSandboxResult(payload);
    } catch (sandboxRunError) {
      setSandboxError(sandboxRunError instanceof Error ? sandboxRunError.message : String(sandboxRunError));
    } finally {
      setSandboxLoading(false);
    }
  }

  async function handleSaveMemoryEntry() {
    if (!memoryForm.content.trim()) {
      setMemoryError("Memory content is required.");
      setMemoryNotice(null);
      return;
    }

    setMemorySaving(true);
    setMemoryError(null);
    setMemoryNotice(null);

    try {
      const response = await fetch("/api/session/memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          id: memoryForm.id,
          title: memoryForm.title || null,
          summary: memoryForm.summary || null,
          content: memoryForm.content,
          kind: memoryForm.kind,
          scope: memoryForm.scope,
          tags: memoryForm.tagsText
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          importance: Number(memoryForm.importance),
          pinned: memoryForm.pinned,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { memory?: DashboardMemoryEntry; error?: string }
        | null;

      if (!response.ok || !payload?.memory) {
        throw new Error(payload?.error || `Memory save failed: ${response.status}`);
      }

      setEditingMemoryId(payload.memory.id);
      await loadMemoryEntries();
      setMemoryNotice(memoryForm.id ? "Memory entry updated." : "Memory entry saved.");
    } catch (saveError) {
      setMemoryError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      setMemorySaving(false);
    }
  }

  async function handleDeleteMemoryEntry(memoryId: string) {
    setMemoryDeletingId(memoryId);
    setMemoryError(null);
    setMemoryNotice(null);

    try {
      const response = await fetch("/api/session/memory", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ id: memoryId }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { deleted?: boolean; error?: string }
        | null;

      if (!response.ok || payload?.deleted !== true) {
        throw new Error(payload?.error || `Memory delete failed: ${response.status}`);
      }

      setEditingMemoryId(null);
      setMemoryForm(EMPTY_MEMORY_FORM);
      await loadMemoryEntries();
      setMemoryNotice("Memory entry deleted.");
    } catch (deleteError) {
      setMemoryError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    } finally {
      setMemoryDeletingId(null);
    }
  }

  function handleStartNewMemoryEntry() {
    setEditingMemoryId(null);
    setMemoryForm(EMPTY_MEMORY_FORM);
    setMemoryError(null);
    setMemoryNotice(null);
  }

  if (authLoading || (isAuthenticated && !hasAuthToken)) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#07111a_0%,_#020617_100%)] text-white">
        <NavBar />
        <div className="mx-auto flex max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="w-full border-slate-800 bg-slate-950/70">
            <CardContent className="flex items-center gap-3 py-8 text-slate-200">
              <Loader2 className="size-4 animate-spin" />
              Resolving secure session...
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !hasAuthToken) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#07111a_0%,_#020617_100%)] text-white">
        <NavBar />
        <div className="mx-auto flex max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="w-full border-cyan-500/20 bg-slate-950/70">
            <CardHeader>
              <CardTitle>Sign in to open your Manifest</CardTitle>
              <CardDescription>
                The account layer already exists. Your first magic-link sign-in creates the auth account and matching user row automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild>
                <a href="/login?redirect=/dashboard">Open sign-in</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/">Back to GestaltView</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(180deg,_#07111a_0%,_#020617_100%)] text-white">
      <NavBar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/">
              <a className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
                <ArrowLeft className="size-4" />
                Back to GestaltView
              </a>
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
                <Crown className="size-5" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Your Manifest</h1>
                <p className="mt-1 max-w-3xl text-sm text-slate-300">
                  Account control plane, admin overrides, founder continuity persistence, and the live Billy runtime environment in one surface.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-200">
              {dashboard?.profile.email || "Authenticated"}
            </Badge>
            {dashboard?.profile.isAdmin ? (
              <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-200" variant="outline">
                Admin active
              </Badge>
            ) : (
              <Badge className="border-amber-500/40 bg-amber-500/10 text-amber-200" variant="outline">
                Admin inactive
              </Badge>
            )}
            {pendingFounderWrites > 0 ? (
              <Badge className="border-cyan-500/40 bg-cyan-500/10 text-cyan-200" variant="outline">
                {pendingFounderWrites} founder sync pending
              </Badge>
            ) : null}
            {founderSyncState === "syncing" ? (
              <Badge className="border-cyan-500/40 bg-cyan-500/10 text-cyan-200" variant="outline">
                <Loader2 className="mr-1 size-3 animate-spin" />
                Syncing founder context
              </Badge>
            ) : null}
            {founderSyncState === "synced" && lastFounderSyncAt ? (
              <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-200" variant="outline">
                Founder synced {formatDate(lastFounderSyncAt)}
              </Badge>
            ) : null}
            <Button variant="outline" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </div>

        {error ? (
          <Card className="mb-6 border-rose-500/20 bg-rose-500/10">
            <CardContent className="py-4 text-sm text-rose-100">{error}</CardContent>
          </Card>
        ) : null}

        {notice ? (
          <Card className="mb-6 border-emerald-500/20 bg-emerald-500/10">
            <CardContent className="py-4 text-sm text-emerald-100">{notice}</CardContent>
          </Card>
        ) : null}

        {pendingFounderWrites > 0 ? (
          <Card className="mb-6 border-cyan-500/20 bg-cyan-500/10">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm text-cyan-100">
              <span>Founder context has locally saved updates pending backend sync.</span>
              <Button
                size="sm"
                variant="outline"
                className="border-cyan-500/40 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
                onClick={() => void flushPendingFounderWrites()}
                disabled={founderSyncState === "syncing"}
              >
                {founderSyncState === "syncing" ? (
                  <Loader2 className="mr-2 size-3.5 animate-spin" />
                ) : (
                  <RefreshCcw className="mr-2 size-3.5" />
                )}
                {founderSyncState === "syncing" ? "Syncing..." : "Sync now"}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {loading ? (
          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-950/70">
              <CardContent className="animate-pulse space-y-4 py-8">
                <div className="h-4 w-32 rounded-full bg-slate-800/80" />
                <div className="h-10 w-2/3 rounded-2xl bg-slate-800/80" />
                <div className="h-4 w-5/6 rounded-full bg-slate-800/70" />
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="border-slate-800 bg-slate-950/70">
                  <CardContent className="animate-pulse space-y-3 py-5">
                    <div className="h-3 w-24 rounded-full bg-slate-800/80" />
                    <div className="h-9 w-20 rounded-2xl bg-slate-800/80" />
                    <div className="h-3 w-40 rounded-full bg-slate-800/70" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-slate-800 bg-slate-950/70">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Loading the newest memory entries and session context...</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="h-3 w-24 rounded-full bg-slate-800/80" />
                    <div className="mt-3 h-4 w-2/3 rounded-full bg-slate-800/80" />
                    <div className="mt-2 h-3 w-5/6 rounded-full bg-slate-800/70" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : dashboard ? (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-2">
              <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="sandbox" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                Sandbox
              </TabsTrigger>
              {showGovernanceTabs ? (
                <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                  Analytics
                </TabsTrigger>
              ) : null}
              {showGovernanceTabs ? (
                <TabsTrigger value="workbook" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                  Workbook
                </TabsTrigger>
              ) : null}
              {showGovernanceTabs ? (
                <TabsTrigger value="packaging" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                  Packaging
                </TabsTrigger>
              ) : null}
            </TabsList>

            <TabsContent value="overview">
              <div className="mb-6 space-y-6">
                {dashboardOverview ? (
                  <>
                    <Card className="border-slate-800 bg-slate-950/70">
                      <CardContent className="flex flex-col gap-4 p-6 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300/80">
                            Dashboard overview
                          </p>
                          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                            {dashboardOverview.greeting}
                          </h2>
                          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                            Sessions, artifacts, and active surfaces at a glance. The control plane stays below this
                            strip, but the launch story starts here.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="border-cyan-500/40 bg-cyan-500/10 text-cyan-100" variant="outline">
                            {dashboard.profile.tier}
                          </Badge>
                          {dashboard.profile.isAdmin ? (
                            <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-100" variant="outline">
                              Admin enabled
                            </Badge>
                          ) : (
                            <Badge className="border-amber-500/40 bg-amber-500/10 text-amber-100" variant="outline">
                              Admin inactive
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-3">
                      {dashboardOverview.metrics.map((metric) => (
                        <Card key={metric.label} className="border-slate-800 bg-slate-950/70">
                          <CardContent className="space-y-2 py-5">
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{metric.label}</p>
                            <p className="text-3xl font-semibold tracking-tight text-white">{metric.value}</p>
                            <p className="text-sm leading-5 text-slate-400">{metric.detail}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="border-slate-800 bg-slate-950/70">
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Memory entries, session fragments, and the last few meaningful updates.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {dashboardOverview.hasActivity ? (
                          dashboardOverview.recentActivity.map((activity) => (
                            <div
                              key={activity.id}
                              className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:flex-row sm:items-start sm:justify-between"
                            >
                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-100">
                                    {activity.badge}
                                  </span>
                                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                                    {activity.when}
                                  </span>
                                </div>
                                <p className="truncate text-sm font-medium text-white">{activity.title}</p>
                                <p className="text-sm leading-6 text-slate-400">{activity.summary}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-400">
                            No recent activity yet. Your first session memory or artifact will appear here.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : null}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
                <div className="space-y-6">
              <Card className="border-slate-800 bg-slate-950/70">
                <CardHeader>
                  <CardTitle>Account State</CardTitle>
                  <CardDescription>
                    Supabase-backed profile, subscription lane, and current founder/admin state.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
                    <p className="mt-2 text-sm text-slate-100">{dashboard.profile.email}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tier</p>
                    <p className="mt-2 text-sm text-slate-100">{dashboard.profile.tier}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Subscription</p>
                    <p className="mt-2 text-sm text-slate-100">{dashboard.profile.subscriptionStatus}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Billy Queries</p>
                    <p className="mt-2 text-sm text-slate-100">{dashboard.profile.billyQueryCount}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Billing Period Start</p>
                    <p className="mt-2 text-sm text-slate-100">{formatDate(dashboard.profile.billingPeriodStart)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Grace Until</p>
                    <p className="mt-2 text-sm text-slate-100">{formatDate(dashboard.profile.graceUntil)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Created</p>
                    <p className="mt-2 text-sm text-slate-100">{formatDate(dashboard.profile.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Updated</p>
                    <p className="mt-2 text-sm text-slate-100">{formatDate(dashboard.profile.updatedAt)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-950/70">
                <CardHeader>
                  <CardTitle>Control Surface</CardTitle>
                  <CardDescription>
                    Fast links into Billy, Voice Studio, and the adjacent internal tooling.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {shortcutCards.map((shortcut) => (
                    <Link key={shortcut.href} href={shortcut.href}>
                      <a className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition-colors hover:border-cyan-400/40 hover:bg-slate-900">
                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                          <Sparkles className="size-4 text-cyan-300" />
                          {shortcut.label}
                        </div>
                        <p className="mt-2 text-sm text-slate-400">{shortcut.detail}</p>
                      </a>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-950/70">
                <CardHeader>
                  <CardTitle>Billy Runtime</CardTitle>
                  <CardDescription>
                    Launch Billy Voice Studio, inspect the live stack, and run API-level checks without leaving the Manifest.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <a href={dashboard.billyRuntime.liveConsolePath}>
                        <Activity className="mr-2 size-4" />
                        Open Billy Live
                      </a>
                    </Button>
                    <Button asChild variant="outline">
                      <a href={dashboard.billyRuntime.voiceStudioPath}>
                        <Mic className="mr-2 size-4" />
                        Open Voice Studio
                      </a>
                    </Button>
                    <Button variant="outline" onClick={() => void handleRunHealthCheck()} disabled={healthLoading}>
                      {healthLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />}
                      Run health check
                    </Button>
                    <Button variant="outline" onClick={() => void handleRunBillySmoke()} disabled={smokeLoading}>
                      {smokeLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                      Run Billy smoke test
                    </Button>
                    <Button asChild variant="outline">
                      <a href="/gravity">
                        <Sparkles className="mr-2 size-4" />
                        Open Gravity Inspector
                      </a>
                    </Button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {billyRuntimeChecks.map((check) => (
                      <div
                        key={check.label}
                        className={cn(
                          "rounded-2xl border px-3 py-3 text-sm",
                          check.configured
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                            : "border-slate-800 bg-slate-900/60 text-slate-300"
                        )}
                      >
                        <div className="font-medium">{check.label}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em]">
                          {check.configured ? "Configured" : "Missing"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {healthError ? (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {healthError}
                    </div>
                  ) : null}

                  {healthSnapshot ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            healthSnapshot.ok
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                              : "border-amber-500/40 bg-amber-500/10 text-amber-200"
                          )}
                        >
                          {healthSnapshot.ok ? "Pipeline healthy" : "Pipeline degraded"}
                        </Badge>
                        <span className="text-xs text-slate-400">{formatDate(healthSnapshot.timestamp)}</span>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Supabase</p>
                          <p className="mt-2 text-sm text-slate-100">{healthSnapshot.supabase?.ok ? "OK" : "Issue detected"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">RPC</p>
                          <p className="mt-2 text-sm text-slate-100">{healthSnapshot.rpc?.ok ? "OK" : "Issue detected"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Configured LLMs</p>
                          <p className="mt-2 text-sm text-slate-100">
                            {getConfiguredLlmProviders(healthSnapshot.llm).join(", ") || "None detected"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {smokeError ? (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {smokeError}
                    </div>
                  ) : null}

                  {smokeResult ? (
                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-cyan-400/40 bg-cyan-400/10 text-cyan-100" variant="outline">
                          Provider {smokeResult.provider}
                        </Badge>
                        <span className="text-xs text-slate-300">Billy text chain responded live.</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-100">{trimPreview(smokeResult.response)}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {dashboard.controls.canAccessAdminTools ? (
                <Card className="border-slate-800 bg-slate-950/70">
                  <CardHeader>
                    <CardTitle>Billy Voice Studio</CardTitle>
                    <CardDescription>
                      Tune the Deepgram profile, audition the current voice, and save the runtime profile from inside the Manifest.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="voice-profile-slug">Profile slug</Label>
                        <Input
                          id="voice-profile-slug"
                          value={voiceProfileForm.profileSlug}
                          onChange={(event) =>
                            setVoiceProfileForm((current) => ({ ...current, profileSlug: event.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voice-profile-name">Display name</Label>
                        <Input
                          id="voice-profile-name"
                          value={voiceProfileForm.displayName}
                          onChange={(event) =>
                            setVoiceProfileForm((current) => ({ ...current, displayName: event.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voice-profile-provider">Provider</Label>
                        <Select
                          value={voiceProfileForm.providerPreference}
                          onValueChange={(value) =>
                            setVoiceProfileForm((current) => ({
                              ...current,
                              providerPreference: value as VoiceProfileFormState["providerPreference"],
                            }))
                          }
                        >
                          <SelectTrigger id="voice-profile-provider">
                            <SelectValue placeholder="Provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deepgram">Deepgram</SelectItem>
                            <SelectItem value="browser">Browser</SelectItem>
                            <SelectItem value="local">Local</SelectItem>
                            <SelectItem value="hf">Hugging Face</SelectItem>
                            <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voice-profile-review">Review status</Label>
                        <Select
                          value={voiceProfileForm.reviewStatus}
                          onValueChange={(value) =>
                            setVoiceProfileForm((current) => ({
                              ...current,
                              reviewStatus: value as VoiceProfileFormState["reviewStatus"],
                            }))
                          }
                        >
                          <SelectTrigger id="voice-profile-review">
                            <SelectValue placeholder="Review status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="proposed">Proposed</SelectItem>
                            <SelectItem value="auditioned">Auditioned</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voice-profile-tts">TTS model</Label>
                        <Input
                          id="voice-profile-tts"
                          value={voiceProfileForm.ttsModel}
                          onChange={(event) =>
                            setVoiceProfileForm((current) => ({ ...current, ttsModel: event.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voice-profile-stt">STT model</Label>
                        <Input
                          id="voice-profile-stt"
                          value={voiceProfileForm.sttModel}
                          onChange={(event) =>
                            setVoiceProfileForm((current) => ({ ...current, sttModel: event.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voice-profile-speaker">Speaker ID</Label>
                        <Input
                          id="voice-profile-speaker"
                          value={voiceProfileForm.speakerId}
                          onChange={(event) =>
                            setVoiceProfileForm((current) => ({ ...current, speakerId: event.target.value }))
                          }
                        />
                      </div>
                      <div className="flex items-end gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                        <Checkbox
                          id="voice-profile-fallback"
                          checked={voiceProfileForm.fallbackTextOnly}
                          onCheckedChange={(checked) =>
                            setVoiceProfileForm((current) => ({
                              ...current,
                              fallbackTextOnly: checked === true,
                            }))
                          }
                        />
                        <Label htmlFor="voice-profile-fallback" className="leading-relaxed">
                          Fallback to text only
                        </Label>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="voice-profile-style">Style preset JSON</Label>
                        <Textarea
                          id="voice-profile-style"
                          className="min-h-48 font-mono text-xs"
                          value={voiceProfileForm.stylePresetText}
                          onChange={(event) =>
                            setVoiceProfileForm((current) => ({ ...current, stylePresetText: event.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voice-profile-config">Provider config JSON</Label>
                        <Textarea
                          id="voice-profile-config"
                          className="min-h-48 font-mono text-xs"
                          value={voiceProfileForm.providerConfigText}
                          onChange={(event) =>
                            setVoiceProfileForm((current) => ({ ...current, providerConfigText: event.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="voice-profile-consent">Consent notes</Label>
                      <Textarea
                        id="voice-profile-consent"
                        className="min-h-28"
                        value={voiceProfileForm.consentNotes}
                        onChange={(event) =>
                          setVoiceProfileForm((current) => ({ ...current, consentNotes: event.target.value }))
                        }
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="voice-profile-auditioned">Last auditioned at</Label>
                        <Input
                          id="voice-profile-auditioned"
                          type="datetime-local"
                          value={voiceProfileForm.lastAuditionedAt}
                          onChange={(event) =>
                            setVoiceProfileForm((current) => ({ ...current, lastAuditionedAt: event.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voice-profile-approved">Approved at</Label>
                        <Input
                          id="voice-profile-approved"
                          type="datetime-local"
                          value={voiceProfileForm.approvedAt}
                          onChange={(event) =>
                            setVoiceProfileForm((current) => ({ ...current, approvedAt: event.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => void handleTestVoiceProfile()} disabled={voiceProfileTesting}>
                        {voiceProfileTesting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Mic className="mr-2 size-4" />}
                        Audition voice
                      </Button>
                      <Button variant="outline" onClick={() => void handleSaveVoiceProfile()} disabled={voiceProfileSaving}>
                        {voiceProfileSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                        Save voice profile
                      </Button>
                      <Button variant="outline" onClick={() => void loadDashboard()} disabled={loading}>
                        <RefreshCcw className="mr-2 size-4" />
                        Reload profile
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Runtime slug</p>
                        <p className="mt-2 text-sm text-slate-100">{dashboard.voiceProfile.profile_slug}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Runtime model</p>
                        <p className="mt-2 text-sm text-slate-100">{dashboard.voiceProfile.tts_model || "Not set"}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Review status</p>
                        <p className="mt-2 text-sm text-slate-100">{dashboard.voiceProfile.review_status}</p>
                      </div>
                    </div>

                    {voiceProfileNotice ? (
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                        {voiceProfileNotice}
                      </div>
                    ) : null}
                    {voiceProfileError ? (
                      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                        {voiceProfileError}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}

              {dashboard.controls.canAccessAdminTools ? (
                <Card className="border-slate-800 bg-slate-950/70">
                  <CardHeader>
                    <CardTitle>Admin User Controls</CardTitle>
                    <CardDescription>
                      Search users, select an account, and override tier, subscription lane, admin state, or grace period.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-5 xl:grid-cols-[1.15fr_0.95fr]">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="dashboard-user-filter">Filter users</Label>
                        <Input
                          id="dashboard-user-filter"
                          value={userFilter}
                          onChange={(event) => setUserFilter(event.target.value)}
                          placeholder="Search by email, tier, or status"
                        />
                      </div>

                      <ScrollArea className="h-[360px] rounded-2xl border border-slate-800 bg-slate-900/60">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-slate-800 hover:bg-transparent">
                              <TableHead className="text-slate-300">User</TableHead>
                              <TableHead className="text-slate-300">Tier</TableHead>
                              <TableHead className="text-slate-300">Status</TableHead>
                              <TableHead className="text-slate-300">Role</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAdminUsers.map((user) => (
                              <TableRow
                                key={user.id}
                                className={cn(
                                  "cursor-pointer border-slate-800 hover:bg-slate-800/60",
                                  user.id === selectedUserId && "bg-slate-800/80"
                                )}
                                onClick={() => setSelectedUserId(user.id)}
                              >
                                <TableCell className="max-w-[250px]">
                                  <div className="truncate text-sm text-slate-100">{user.email}</div>
                                  <div className="mt-1 text-xs text-slate-400">{formatDate(user.updatedAt)}</div>
                                </TableCell>
                                <TableCell className="text-slate-200">{user.tier}</TableCell>
                                <TableCell className="text-slate-200">{user.subscriptionStatus}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      user.isAdmin
                                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                                        : "border-slate-700 bg-slate-900/60 text-slate-300"
                                    )}
                                  >
                                    {user.isAdmin ? "Admin" : "Member"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                            {filteredAdminUsers.length === 0 ? (
                              <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableCell colSpan={4} className="py-8 text-center text-sm text-slate-400">
                                  No matching users found.
                                </TableCell>
                              </TableRow>
                            ) : null}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      {selectedAdminUser && adminUserForm ? (
                        <>
                          <div className="flex items-start gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-100">
                              <Users className="size-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{selectedAdminUser.email}</p>
                              <p className="mt-1 text-sm text-slate-400">
                                Billy queries {selectedAdminUser.billyQueryCount} • created {formatDate(selectedAdminUser.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="dashboard-user-tier">Tier</Label>
                              <Select
                                value={adminUserForm.tier}
                                onValueChange={(value) =>
                                  setAdminUserForm((current) =>
                                    current ? { ...current, tier: value as AdminUserFormState["tier"] } : current
                                  )
                                }
                              >
                                <SelectTrigger id="dashboard-user-tier">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="free">Free</SelectItem>
                                  <SelectItem value="core">Core</SelectItem>
                                  <SelectItem value="pro">Pro</SelectItem>
                                  <SelectItem value="enterprise">Enterprise</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="dashboard-user-subscription">Subscription</Label>
                              <Select
                                value={adminUserForm.subscriptionStatus}
                                onValueChange={(value) =>
                                  setAdminUserForm((current) =>
                                    current ? { ...current, subscriptionStatus: value } : current
                                  )
                                }
                              >
                                <SelectTrigger id="dashboard-user-subscription">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SUBSCRIPTION_OPTIONS.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="dashboard-user-billing">Billing period start</Label>
                              <Input
                                id="dashboard-user-billing"
                                type="datetime-local"
                                value={adminUserForm.billingPeriodStartInput}
                                onChange={(event) =>
                                  setAdminUserForm((current) =>
                                    current ? { ...current, billingPeriodStartInput: event.target.value } : current
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="dashboard-user-grace">Grace until</Label>
                              <Input
                                id="dashboard-user-grace"
                                type="datetime-local"
                                value={adminUserForm.graceUntilInput}
                                onChange={(event) =>
                                  setAdminUserForm((current) =>
                                    current ? { ...current, graceUntilInput: event.target.value } : current
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                            <Checkbox
                              id="dashboard-user-admin"
                              checked={adminUserForm.isAdmin}
                              onCheckedChange={(checked) =>
                                setAdminUserForm((current) =>
                                  current ? { ...current, isAdmin: checked === true } : current
                                )
                              }
                            />
                            <div className="space-y-1">
                              <Label htmlFor="dashboard-user-admin">Admin access</Label>
                              <p className="text-sm text-slate-400">
                                Grants internal surfaces like Agent Trainer and user override controls.
                              </p>
                            </div>
                          </div>

                          <Separator />

                          <div className="flex flex-wrap items-center gap-3">
                            <Button onClick={() => void handleSaveUserAccount()} disabled={savingUser}>
                              {savingUser ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                              Save account overrides
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setAdminUserForm(createAdminUserFormState(selectedAdminUser))}
                              disabled={savingUser}
                            >
                              Reset form
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-slate-400">Select a user to manage account overrides.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div className="space-y-6">
              <Card className="border-slate-800 bg-slate-950/70">
                <CardHeader>
                  <CardTitle>Founder Admin</CardTitle>
                  <CardDescription>
                    Unlocks admin-gated infrastructure and marks this account as the founder control account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    {dashboard.profile.isAdmin ? (
                      <BadgeCheck className="mt-0.5 size-5 text-emerald-300" />
                    ) : (
                      <KeyRound className="mt-0.5 size-5 text-amber-300" />
                    )}
                    <div className="space-y-1 text-sm text-slate-300">
                      <p className="font-medium text-white">
                        {dashboard.profile.isAdmin ? "Founder admin is active." : "Founder admin is not active yet."}
                      </p>
                      <p>
                        {dashboard.controls.adminSeedHint ||
                          "This account already has the internal admin gate unlocked."}
                      </p>
                    </div>
                  </div>

                  {dashboard.controls.founderBootstrapEligible && !dashboard.profile.isAdmin ? (
                    <Button onClick={() => void handleActivateFounderAdmin()} disabled={bootstrapping}>
                      {bootstrapping ? <Loader2 className="mr-2 size-4 animate-spin" /> : <ShieldCheck className="mr-2 size-4" />}
                      Activate founder admin
                    </Button>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-950/70">
                <CardHeader>
                  <CardTitle>Founder Persistence</CardTitle>
                  <CardDescription>
                    Stores persistent founder continuity fields that Billy reads during bootstrap and live sessions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {dashboard.controls.founderControlActive ? (
                    <>
                      <div
                        className={cn(
                          "flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 text-sm",
                          founderSyncState === "failed"
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-100"
                            : founderSyncState === "syncing"
                              ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
                              : "border-slate-800 bg-slate-900/70 text-slate-300"
                        )}
                      >
                        <div>
                          <p className="font-medium text-white">Founder context sync</p>
                          <p className="mt-1 text-xs opacity-80">
                            {founderSyncState === "syncing"
                              ? "Backend sync is running now."
                              : founderSyncState === "failed"
                                ? "Last sync attempt failed. Local pending writes are still preserved."
                                : lastFounderSyncAt
                                  ? `Last confirmed sync: ${formatDate(lastFounderSyncAt)}`
                                  : "Save writes immediately when possible; degraded saves stay local until synced."}
                          </p>
                        </div>
                        {pendingFounderWrites > 0 ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-cyan-500/40 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
                            onClick={() => void flushPendingFounderWrites()}
                            disabled={founderSyncState === "syncing"}
                          >
                            {founderSyncState === "syncing" ? (
                              <Loader2 className="mr-2 size-3.5 animate-spin" />
                            ) : (
                              <RefreshCcw className="mr-2 size-3.5" />
                            )}
                            {founderSyncState === "syncing" ? "Syncing..." : "Sync pending"}
                          </Button>
                        ) : null}
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="dashboard-mode">Mode preference</Label>
                          <Select
                            value={founderForm.modePreference}
                            onValueChange={(value) =>
                              setFounderForm((current) => ({
                                ...current,
                                modePreference: value as FounderFormState["modePreference"],
                              }))
                            }
                          >
                            <SelectTrigger id="dashboard-mode">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="synthesis">Synthesis</SelectItem>
                              <SelectItem value="chat">Session</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dashboard-last-session">Last session</Label>
                          <Input
                            id="dashboard-last-session"
                            readOnly
                            value={formatDate(dashboard.founderContext?.lastSessionAt ?? null)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <Checkbox
                          id="dashboard-confirmed-adult"
                          checked={founderForm.confirmedAdult}
                          onCheckedChange={(checked) =>
                            setFounderForm((current) => ({
                              ...current,
                              confirmedAdult: checked === true,
                            }))
                          }
                        />
                        <div className="space-y-1">
                          <Label htmlFor="dashboard-confirmed-adult">Confirmed adult</Label>
                          <p className="text-sm text-slate-400">
                            Keeps the founder continuity record aligned with Billy&apos;s metadata envelope.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dashboard-current-state">Current state</Label>
                        <Textarea
                          id="dashboard-current-state"
                          rows={5}
                          value={founderForm.currentState}
                          onChange={(event) =>
                            setFounderForm((current) => ({ ...current, currentState: event.target.value }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dashboard-session-thread">Session thread</Label>
                        <Textarea
                          id="dashboard-session-thread"
                          rows={7}
                          value={founderForm.sessionThread}
                          onChange={(event) =>
                            setFounderForm((current) => ({ ...current, sessionThread: event.target.value }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dashboard-plk">PLK snapshot JSON</Label>
                        <Textarea
                          id="dashboard-plk"
                          rows={12}
                          value={founderForm.plkSnapshotText}
                          onChange={(event) =>
                            setFounderForm((current) => ({ ...current, plkSnapshotText: event.target.value }))
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex flex-wrap items-center gap-3">
                        <Button onClick={() => void handleSaveFounderContext()} disabled={saving}>
                          {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                          Save founder persistence
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setFounderForm(createFounderFormState(dashboard.founderContext))}
                          disabled={saving}
                        >
                          Reset values
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
                      Founder persistence activates once this account is a founder-eligible address or already has admin access.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-950/70">
                <CardHeader>
                  <CardTitle>Persistent Memory Bank</CardTitle>
                  <CardDescription>
                    Curate what Billy should remember for this account. This is explicit long-term memory capture, not automatic chat ingestion.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {memoryError ? (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {memoryError}
                    </div>
                  ) : null}

                  {memoryNotice ? (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                      {memoryNotice}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100">
                      {memoryEntries.length} loaded
                    </Badge>
                    <Badge variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-300">
                      Explicit curation only
                    </Badge>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        <div className="min-w-[220px] flex-1 space-y-2">
                          <Label htmlFor="dashboard-memory-filter">Filter memories</Label>
                          <Input
                            id="dashboard-memory-filter"
                            value={memoryFilter}
                            onChange={(event) => setMemoryFilter(event.target.value)}
                            placeholder="Title, content, tags, kind"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <Button variant="outline" onClick={() => void loadMemoryEntries()} disabled={memoryLoading}>
                            {memoryLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />}
                            Refresh
                          </Button>
                          <Button variant="outline" onClick={handleStartNewMemoryEntry} disabled={memorySaving}>
                            <PlusCircle className="mr-2 size-4" />
                            New entry
                          </Button>
                        </div>
                      </div>

                      <ScrollArea className="h-[380px] rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                        <div className="space-y-3">
                          {filteredMemoryEntries.map((memory) => {
                            const active = memory.id === editingMemoryId;
                            return (
                              <button
                                key={memory.id}
                                type="button"
                                className={cn(
                                  "w-full rounded-2xl border p-4 text-left transition-colors",
                                  active
                                    ? "border-cyan-400/40 bg-cyan-500/10"
                                    : "border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900"
                                )}
                                onClick={() => {
                                  setEditingMemoryId(memory.id);
                                  setMemoryForm(createMemoryFormState(memory));
                                  setMemoryError(null);
                                  setMemoryNotice(null);
                                }}
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                                    <Brain className="size-4 text-cyan-200" />
                                    {memory.title || trimPreview(memory.content, 56)}
                                  </div>
                                  <Badge variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-300">
                                    {memory.scope}
                                  </Badge>
                                  <Badge variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-300">
                                    {memory.kind}
                                  </Badge>
                                  <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-100">
                                    Importance {memory.importance}
                                  </Badge>
                                  {memory.pinned ? (
                                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-100">
                                      Pinned
                                    </Badge>
                                  ) : null}
                                </div>
                                <p className="mt-3 text-sm text-slate-300">
                                  {trimPreview(memory.summary || memory.content, 180)}
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                  <span>Updated {formatDate(memory.updated_at)}</span>
                                  {(memory.tags ?? []).slice(0, 3).map((tag) => (
                                    <span key={`${memory.id}-${tag}`} className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-400">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </button>
                            );
                          })}

                          {!memoryLoading && filteredMemoryEntries.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 px-4 py-8 text-center text-sm text-slate-400">
                              {memoryEntries.length === 0
                                ? "No memory entries saved yet. Start by curating one in the editor."
                                : "No memory entries match the current filter."}
                            </div>
                          ) : null}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-100">
                          <Brain className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {editingMemoryId ? "Edit memory entry" : "New memory entry"}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            Capture only signal Billy should carry across sessions.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="dashboard-memory-kind">Kind</Label>
                          <Select
                            value={memoryForm.kind}
                            onValueChange={(value) =>
                              setMemoryForm((current) => ({
                                ...current,
                                kind: value as MemoryFormState["kind"],
                              }))
                            }
                          >
                            <SelectTrigger id="dashboard-memory-kind">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MEMORY_KIND_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dashboard-memory-scope">Scope</Label>
                          <Select
                            value={memoryForm.scope}
                            onValueChange={(value) =>
                              setMemoryForm((current) => ({
                                ...current,
                                scope: value as MemoryFormState["scope"],
                              }))
                            }
                          >
                            <SelectTrigger id="dashboard-memory-scope">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MEMORY_SCOPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="dashboard-memory-title">Title</Label>
                          <Input
                            id="dashboard-memory-title"
                            value={memoryForm.title}
                            onChange={(event) =>
                              setMemoryForm((current) => ({ ...current, title: event.target.value }))
                            }
                            placeholder="Short handle for this memory"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dashboard-memory-importance">Importance</Label>
                          <Select
                            value={memoryForm.importance}
                            onValueChange={(value) =>
                              setMemoryForm((current) => ({
                                ...current,
                                importance: value as MemoryFormState["importance"],
                              }))
                            }
                          >
                            <SelectTrigger id="dashboard-memory-importance">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MEMORY_IMPORTANCE_OPTIONS.map((value) => (
                                <SelectItem key={value} value={value}>
                                  {value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dashboard-memory-summary">Summary</Label>
                        <Textarea
                          id="dashboard-memory-summary"
                          rows={3}
                          value={memoryForm.summary}
                          onChange={(event) =>
                            setMemoryForm((current) => ({ ...current, summary: event.target.value }))
                          }
                          placeholder="One short sentence Billy can use fast."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dashboard-memory-content">Memory content</Label>
                        <Textarea
                          id="dashboard-memory-content"
                          rows={8}
                          value={memoryForm.content}
                          onChange={(event) =>
                            setMemoryForm((current) => ({ ...current, content: event.target.value }))
                          }
                          placeholder="Capture the actual thing worth remembering."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dashboard-memory-tags">Tags</Label>
                        <Input
                          id="dashboard-memory-tags"
                          value={memoryForm.tagsText}
                          onChange={(event) =>
                            setMemoryForm((current) => ({ ...current, tagsText: event.target.value }))
                          }
                          placeholder="workflow, billy, continuity"
                        />
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                        <Checkbox
                          id="dashboard-memory-pinned"
                          checked={memoryForm.pinned}
                          onCheckedChange={(checked) =>
                            setMemoryForm((current) => ({
                              ...current,
                              pinned: checked === true,
                            }))
                          }
                        />
                        <div className="space-y-1">
                          <Label htmlFor="dashboard-memory-pinned">Pinned memory</Label>
                          <p className="text-sm text-slate-400">
                            Keep this memory weighted toward the top of the recall layer.
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex flex-wrap items-center gap-3">
                        <Button onClick={() => void handleSaveMemoryEntry()} disabled={memorySaving}>
                          {memorySaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                          {editingMemoryId ? "Save memory changes" : "Save memory"}
                        </Button>
                        <Button variant="outline" onClick={handleStartNewMemoryEntry} disabled={memorySaving}>
                          <PlusCircle className="mr-2 size-4" />
                          Clear form
                        </Button>
                        {editingMemoryId ? (
                          <Button
                            variant="outline"
                            className="border-rose-500/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
                            onClick={() => void handleDeleteMemoryEntry(editingMemoryId)}
                            disabled={memoryDeletingId === editingMemoryId}
                          >
                            {memoryDeletingId === editingMemoryId ? (
                              <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 size-4" />
                            )}
                            Delete memory
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sandbox">
              <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
                <Card className="border-slate-800 bg-slate-950/70">
                  <CardHeader>
                    <CardTitle>Founder Sandbox</CardTitle>
                    <CardDescription>
                      Private playground for authenticated Billy prompts, routing checks, and retrieval inspection.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="sandbox-mode">Mode</Label>
                        <Select
                          value={sandboxMode}
                          onValueChange={(value) => setSandboxMode(value as "chat" | "synthesis")}
                        >
                          <SelectTrigger id="sandbox-mode">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chat">Session</SelectItem>
                            <SelectItem value="synthesis">Synthesis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sandbox-section">Section tag</Label>
                        <Input
                          id="sandbox-section"
                          value={sandboxSection}
                          onChange={(event) => setSandboxSection(event.target.value)}
                          placeholder="manifest-playground"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sandbox-prompt">Prompt</Label>
                      <Textarea
                        id="sandbox-prompt"
                        rows={10}
                        value={sandboxPrompt}
                        onChange={(event) => setSandboxPrompt(event.target.value)}
                        placeholder="Write a private founder prompt here."
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => void handleRunSandboxPrompt()} disabled={sandboxLoading || !sandboxPrompt.trim()}>
                        {sandboxLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                        Run sandbox prompt
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSandboxResult(null);
                          setSandboxError(null);
                        }}
                      >
                        Clear result
                      </Button>
                    </div>

                    {sandboxError ? (
                      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                        {sandboxError}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="border-slate-800 bg-slate-950/70">
                    <CardHeader>
                      <CardTitle>Sandbox Output</CardTitle>
                      <CardDescription>
                        Response, provider, and context signals from the live Billy runtime.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {sandboxResult ? (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="border-cyan-400/40 bg-cyan-400/10 text-cyan-100">
                              Provider {sandboxResult.provider}
                            </Badge>
                            <Badge variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-300">
                              Mode {sandboxMode}
                            </Badge>
                            {typeof sandboxResult.tokensUsed === "number" ? (
                              <Badge variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-300">
                                Tokens {sandboxResult.tokensUsed}
                              </Badge>
                            ) : null}
                          </div>

                          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-100">
                              {sandboxResult.response}
                            </p>
                          </div>

                          {sandboxResult.metadata ? (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Metadata</p>
                              <pre className="mt-3 overflow-x-auto text-xs text-slate-300">
                                {JSON.stringify(sandboxResult.metadata, null, 2)}
                              </pre>
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Run a sandbox prompt to inspect the authenticated Billy response path.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-slate-800 bg-slate-950/70">
                    <CardHeader>
                      <CardTitle>Retrieved Context</CardTitle>
                      <CardDescription>
                        The knowledge chunks Billy used for this sandbox call.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {sandboxResult?.chunks?.length ? (
                        <div className="space-y-2">
                          {sandboxResult.chunks.map((chunk) => (
                            <div
                              key={`${chunk.document_id}:${chunk.chunk_index}`}
                              className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs text-slate-200">{chunk.filename}</span>
                                <Badge variant="outline" className="border-slate-700 bg-slate-950/50 text-slate-300">
                                  chunk {chunk.chunk_index}
                                </Badge>
                                {chunk.document_type ? (
                                  <Badge variant="outline" className="border-slate-700 bg-slate-950/50 text-slate-300">
                                    {chunk.document_type}
                                  </Badge>
                                ) : null}
                                <span className="text-xs text-slate-500">
                                  score {typeof chunk.score === "number" ? chunk.score.toFixed(3) : "n/a"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No retrieval chunks captured yet.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {showGovernanceTabs ? (
              <TabsContent value="analytics">
                <OrchestrationAnalyticsPanel />
              </TabsContent>
            ) : null}

            {showGovernanceTabs ? (
              <TabsContent value="workbook">
                <WorkbookSyncPanel authHeaders={getAuthHeader()} />
              </TabsContent>
            ) : null}

            {showGovernanceTabs ? (
              <TabsContent value="packaging">
                <PackagingGatePanel
                  experiments={governance.experiments}
                  selectedExperiment={governance.selectedExperiment}
                  candidates={governance.packagingCandidates}
                  isMutating={governance.isMutating}
                  error={governance.error}
                  onSelectExperiment={async (experimentId) => {
                    await governance.loadExperiment(experimentId);
                  }}
                  onAttachSource={async (experimentId, payload) => {
                    await governance.attachSource(experimentId, payload);
                  }}
                  onNominate={async (payload) => {
                    await governance.nominatePackaging(payload);
                  }}
                  onUpdateCandidate={async (candidateId, payload) => {
                    await governance.updatePackagingCandidate(candidateId, payload);
                  }}
                  onUploadAttachment={async (candidateId, payload) => {
                    await governance.uploadPackagingAttachment(candidateId, payload);
                  }}
                />
              </TabsContent>
            ) : null}
          </Tabs>
        ) : (
          <Card className="border-slate-800 bg-slate-950/70">
            <CardContent className="py-6 text-sm text-slate-300">
              Manifest state is unavailable right now. Reload or sign back in and try again.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
