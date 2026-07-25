import { useEffect, useMemo, useState } from "react";
import { Bot, BrainCircuit, FileCode2, Loader2, RefreshCcw, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  getEmbodimentGovernanceSummary,
  getEmbodimentUIPresence,
  getProfileBySlug,
} from "@/lib/embodimentRuntime";
import { TRAINER_EMBODIMENT_OPTIONS } from "@shared/agent-trainer/embodiment";
import type { EmbodimentProfile } from "@shared/embodiment";
import type { TrainerExperimentDetail } from "@shared/agent-trainer/schemas";

type AssistantMessage = {
  role: "agent" | "user";
  text: string;
};

type CompilerMode = "compile_profile" | "generate_artifact" | "audit_drift" | "custom";

const MODE_PRESETS: Record<CompilerMode, { label: string; prompt: string }> = {
  compile_profile: {
    label: "Compile profile",
    prompt:
      "Compile the selected embodiment profile into a concise implementation plan. Return the profile deltas that matter, the files that should be touched, the derived artifacts that need regeneration, and the validation steps that should happen before any save.",
  },
  generate_artifact: {
    label: "Generate artifacts",
    prompt:
      "Generate the artifact plan for the selected embodiment profile. Focus on the exact derived outputs, the order they should be written or regenerated, and a short checklist for keeping generated files and source profiles in sync.",
  },
  audit_drift: {
    label: "Audit drift",
    prompt:
      "Audit the selected embodiment profile for drift against its generated artifacts and runtime presentation. Call out missing fields, stale copy, weak room bindings, and any validation gaps that should be fixed first.",
  },
  custom: {
    label: "Custom",
    prompt: "",
  },
};

function buildSelectedExperimentSummary(experiment: TrainerExperimentDetail | null): string {
  if (!experiment) {
    return "No experiment is selected. Use the selected embodiment profile as the working target.";
  }

  const lines = [
    `Experiment: ${experiment.title}`,
    `Slug: ${experiment.slug}`,
    `Domain: ${experiment.domain}`,
    `Purpose: ${experiment.purpose}`,
    experiment.embodimentProfileSlug
      ? `Embodiment profile slug: ${experiment.embodimentProfileSlug}`
      : "Embodiment profile slug: not set",
    `Source count: ${experiment.sourceCount}`,
    `Review count: ${experiment.reviewCount}`,
    `Blocking flags: ${experiment.unresolvedBlockingFlagCount}`,
    `Packaging eligible: ${experiment.packagingEligible ? "yes" : "no"}`,
  ];

  return lines.join("\n");
}

function buildProfileBrief(profile: EmbodimentProfile | null) {
  if (!profile) {
    return {
      profile: null,
      summary: "No embodiment profile data could be loaded for the selected slug.",
      displayName: "unknown profile",
    };
  }

  const presence = getEmbodimentUIPresence(profile);
  const governance = getEmbodimentGovernanceSummary(profile);
  const origin = profile.originContext || profile.immutableCore.foundationalTruth || "No origin context available.";
  const personalityParts = [
    `Archetype: ${profile.immutableCore.archetype}`,
    `Voice: ${profile.immutableCore.voiceTone}`,
    profile.immutableCore.coreWisdom ? `Wisdom: ${profile.immutableCore.coreWisdom}` : null,
    profile.immutableCore.coreValues?.length
      ? `Values: ${profile.immutableCore.coreValues.slice(0, 4).join(", ")}`
      : null,
  ].filter(Boolean);
  const quirks = profile.immutableCore.linguisticPatterns
    ? [
        ...(profile.immutableCore.linguisticPatterns.alwaysDoes ?? []).slice(0, 2).map((item) => `Always: ${item}`),
        ...(profile.immutableCore.linguisticPatterns.neverDoes ?? []).slice(0, 2).map((item) => `Avoids: ${item}`),
      ]
    : [];
  const skills = (profile.skillGraph ?? [])
    .slice(0, 3)
    .map((skill) => `${skill.skillSlug} (${Math.round(Number(skill.proficiency ?? 0) * 100)}%)`);

  return {
    profile,
    summary: [
      `Public name: ${profile.publicName}`,
      `Origin: ${origin}`,
      personalityParts.length ? personalityParts.join("\n") : null,
      quirks.length ? `Quirks:\n- ${quirks.join("\n- ")}` : null,
      skills.length ? `Skills: ${skills.join(", ")}` : null,
      `Status: ${presence?.profileStatus ?? "active"}`,
      `Visibility: ${presence?.visibilityScope ?? "founder-only"}`,
      `Founder-only: ${governance.founderOnly ? "yes" : "no"}`,
      `Experimental: ${governance.experimental ? "yes" : "no"}`,
      `Archived: ${governance.archived ? "yes" : "no"}`,
    ]
      .filter(Boolean)
      .join("\n"),
    displayName: profile.publicName,
  };
}

function buildProfileSummary(slug: string) {
  const profile = getProfileBySlug(slug);
  return buildProfileBrief(profile);
}

function buildAssistantPrompt(args: {
  mode: CompilerMode;
  question: string;
  experimentSummary: string;
  profileSummary: string;
}) {
  const baseInstructions = [
    "You are the GestaltView embodiment compiler intelligence inside the dashboard trainer.",
    "Help the founder compile, validate, and generate embodiment_profiles and their derived artifacts.",
    "Be concrete and repo-aware. Prefer exact file paths, exact outputs, and next-step validation.",
    "If something looks incomplete, call it out directly instead of smoothing over the gap.",
    "Return the answer in short sections using this shape:",
    "1. What to change",
    "2. Artifact targets",
    "3. Validation",
    "4. Risks or open questions",
  ].join("\n");

  return [
    baseInstructions,
    "",
    `MODE: ${args.mode}`,
    "",
    "EXPERIMENT CONTEXT",
    args.experimentSummary,
    "",
    "PROFILE CONTEXT",
    args.profileSummary,
    "",
    "USER REQUEST",
    args.question,
  ].join("\n");
}

export function EmbodimentCompilerPanel(props: {
  authHeaders: Record<string, string>;
  selectedExperiment: TrainerExperimentDetail | null;
  groqConfigured: boolean;
}) {
  const defaultProfileSlug =
    props.selectedExperiment?.embodimentProfileSlug ?? "groq-embodiment-expert";
  const [profileSlug, setProfileSlug] = useState(defaultProfileSlug);
  const [mode, setMode] = useState<CompilerMode>("compile_profile");
  const [question, setQuestion] = useState(MODE_PRESETS.compile_profile.prompt);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: "agent",
      text: "I can compile the selected embodiment profile, map derived artifacts, and point out drift before you write files.",
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProfileSummary = useMemo(() => buildProfileSummary(profileSlug), [profileSlug]);
  const selectedExperimentSummary = useMemo(
    () => buildSelectedExperimentSummary(props.selectedExperiment),
    [props.selectedExperiment]
  );

  useEffect(() => {
    if (!props.selectedExperiment?.embodimentProfileSlug) {
      return;
    }

    setProfileSlug(props.selectedExperiment.embodimentProfileSlug);
  }, [props.selectedExperiment?.embodimentProfileSlug]);

  useEffect(() => {
    if (mode === "custom") {
      return;
    }

    setQuestion(MODE_PRESETS[mode].prompt);
  }, [mode]);

  function applyPreset(nextMode: CompilerMode) {
    setMode(nextMode);
    if (nextMode !== "custom") {
      setQuestion(MODE_PRESETS[nextMode].prompt);
    }
  }

  async function sendPrompt() {
    const trimmed = question.trim();
    if (!trimmed) {
      setError("Add a request first.");
      return;
    }

    setIsSending(true);
    setError(null);

    const prompt = buildAssistantPrompt({
      mode,
      question: trimmed,
      experimentSummary: selectedExperimentSummary,
      profileSummary: selectedProfileSummary.summary,
    });

    const snapshot: AssistantMessage[] = [
      {
        role: "agent",
        text: "Compilation channel open. Bring me the profile or artifact target you want to shape.",
      },
      { role: "user", text: prompt },
    ];

    setMessages(snapshot);

    try {
      const response = await fetch("/api/trainer/persona-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...props.authHeaders,
        },
        body: JSON.stringify({
          personaId: "embodiment-expert",
          embodimentProfileSlug: profileSlug,
          messages: snapshot,
        }),
      });

      const payload = (await response.json()) as { text?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? `Assistant request failed with ${response.status}.`);
      }

      const reply = payload.text?.trim() || "No response returned.";
      setMessages((current) => [...current, { role: "agent", text: reply }]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Assistant request failed.");
      setMessages((current) => [
        ...current,
        {
          role: "agent",
          text: "The compiler channel is unavailable right now. Groq or the fallback provider may be missing, but the profile and artifact context are still ready for manual use.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card className="border-slate-700/50 bg-slate-900/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BrainCircuit className="size-4 text-cyan-300" />
          Embodiment Expert Intelligence
        </CardTitle>
        <CardDescription>
          Groq-first helper for compiling embodiment_profiles, generating derived artifacts, and checking drift before you write files.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "border",
                props.groqConfigured
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-100"
              )}
            >
              {props.groqConfigured ? "Groq primary path ready" : "Fallback cascade active"}
            </Badge>
            <Badge variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-300">
              persona: embodiment-expert
            </Badge>
            <Badge variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-300">
              profile: {selectedProfileSummary.displayName}
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Target profile</label>
              <Select value={profileSlug} onValueChange={setProfileSlug}>
                <SelectTrigger className="border-slate-600 bg-slate-800/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRAINER_EMBODIMENT_OPTIONS.map((profile) => (
                    <SelectItem key={profile.slug} value={profile.slug}>
                      {profile.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Mode</label>
              <Select value={mode} onValueChange={(value) => applyPreset(value as CompilerMode)}>
                <SelectTrigger className="border-slate-600 bg-slate-800/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MODE_PRESETS).map(([value, preset]) => (
                    <SelectItem key={value} value={value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Profile brief</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">
              {selectedProfileSummary.summary}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Artifact targets</p>
            <div className="mt-3 space-y-2 text-sm text-slate-200">
              <div className="flex items-start gap-2">
                <FileCode2 className="mt-0.5 size-4 text-cyan-300" />
                <span>embodiment_profiles/{profileSlug}.embodiment.json</span>
              </div>
              <div className="flex items-start gap-2">
                <FileCode2 className="mt-0.5 size-4 text-cyan-300" />
                <span>shared/embodiment/generated.ts</span>
              </div>
              <div className="flex items-start gap-2">
                <FileCode2 className="mt-0.5 size-4 text-cyan-300" />
                <span>scripts/build-embodiment-artifacts.mjs</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Request</label>
            <Textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="min-h-[140px] border-slate-600 bg-slate-800/60 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              onClick={() => void sendPrompt()}
              disabled={isSending}
            >
              {isSending ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : <Sparkles className="mr-2 size-3.5" />}
              {isSending ? "Asking compiler..." : "Ask compiler"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-slate-600 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60"
              onClick={() => applyPreset("compile_profile")}
            >
              <RefreshCcw className="mr-2 size-3.5" />
              Reset compile prompt
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-slate-600 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60"
              onClick={() => applyPreset("generate_artifact")}
            >
              <Bot className="mr-2 size-3.5" />
              Artifact plan
            </Button>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-cyan-300" />
              <p className="text-sm font-medium text-white">Compiler output</p>
            </div>
            <ScrollArea className="mt-3 h-[500px] rounded-xl border border-slate-700/40 bg-slate-950/50 p-3">
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}-${message.text.slice(0, 16)}`}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm leading-6",
                      message.role === "user"
                        ? "ml-2 border-cyan-500/20 bg-cyan-500/10 text-cyan-50"
                        : "mr-2 border-slate-700/50 bg-slate-900/70 text-slate-100"
                    )}
                  >
                    <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-slate-400">
                      {message.role === "user" ? "Prompt" : "Assistant"}
                    </p>
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current experiment</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">
              {selectedExperimentSummary}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
