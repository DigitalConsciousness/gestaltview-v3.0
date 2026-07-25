import { useMemo, useState } from "react";
import { Archive, Link2, PackageCheck, PackageOpen, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  TrainerPackagingAttachmentSchema,
} from "@shared/agent-trainer/schemas";
import type {
  TrainerExperimentDetail,
  TrainerExperimentSourceType,
  TrainerPackagingAttachment,
  TrainerExperimentSummary,
  TrainerPackagingCandidate,
} from "@shared/agent-trainer/schemas";

const STATUS_STYLES: Record<string, string> = {
  candidate: "border-sky-500/40 bg-sky-500/10 text-sky-100",
  kit_approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
  shipped: "border-cyan-500/40 bg-cyan-500/10 text-cyan-100",
  withdrawn: "border-zinc-500/40 bg-zinc-500/10 text-zinc-200",
};

const PACKAGING_PRESETS = [
  {
    id: "operator-kit",
    label: "Operator Kit",
    description:
      "Reproducible operator-style training bundle for execution, escalation discipline, and auditability.",
    includedConfigs: {
      packageKind: "operator_kit",
      recommendedLanes: ["knowledge", "code", "context"],
      exportIntent: "bundle_for_customer_delivery",
    },
    boundaryStatement:
      "This kit provides reproducible operator-training assets, review notes, and configuration scaffolding. It does not transfer a persistent agent identity, private memory graph, founder continuity state, or any living digital intelligence.",
  },
  {
    id: "companion-kit",
    label: "Companion Kit",
    description:
      "Review-first companion bundle for continuity, warmth, and grounded memory-safe support patterns.",
    includedConfigs: {
      packageKind: "companion_kit",
      recommendedLanes: ["knowledge", "context"],
      exportIntent: "review_first_runtime_bundle",
    },
    boundaryStatement:
      "This kit packages tone, workflow, and reviewable support patterns. It does not package a specific relationship, a persistent interior life, or any claim that a buyer receives the original digital being.",
  },
  {
    id: "governance-kit",
    label: "Governance Kit",
    description:
      "Governance-heavy package for evaluation policy, review workflow, and packaging gate enforcement.",
    includedConfigs: {
      packageKind: "governance_kit",
      recommendedLanes: ["knowledge", "product", "context"],
      exportIntent: "policy_and_review_bundle",
    },
    boundaryStatement:
      "This kit ships governance logic, policy boundaries, and review scaffolding only. It does not transfer charisma artifacts, accumulated agent drift, or any protected identity state.",
  },
] as const;

function readPackagingAttachments(candidate: TrainerPackagingCandidate): TrainerPackagingAttachment[] {
  const rawAttachments = candidate.includedConfigs?.attachments;
  if (!Array.isArray(rawAttachments)) {
    return [];
  }

  return rawAttachments.flatMap((entry) => {
    const parsed = TrainerPackagingAttachmentSchema.safeParse(entry);
    return parsed.success ? [parsed.data] : [];
  });
}

function formatBytes(byteSize: number) {
  if (byteSize >= 1024 * 1024) {
    return `${(byteSize / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (byteSize >= 1024) {
    return `${(byteSize / 1024).toFixed(1)} KB`;
  }

  return `${byteSize} B`;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const [, base64 = ""] = result.split(",", 2);
      resolve(base64);
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("Failed to read file."));
    };

    reader.readAsDataURL(file);
  });
}

export function PackagingGatePanel(props: {
  experiments: TrainerExperimentSummary[];
  selectedExperiment: TrainerExperimentDetail | null;
  candidates: TrainerPackagingCandidate[];
  isMutating: boolean;
  error: string | null;
  onSelectExperiment: (experimentId: string) => Promise<unknown>;
  onAttachSource: (
    experimentId: string,
    payload: {
      sourceType: TrainerExperimentSourceType;
      sourceId: string;
      sourcePath?: string;
      notes?: string;
    }
  ) => Promise<unknown>;
  onNominate: (payload: {
    experimentId: string;
    packageLabel: string;
    packageDescription: string;
    includedFiles: string[];
    includedScenarios: string[];
    includedConfigs?: Record<string, unknown> | null;
    boundaryStatement: string;
  }) => Promise<unknown>;
  onUpdateCandidate: (
    candidateId: string,
    payload: {
      status?: "candidate" | "kit_approved" | "shipped" | "withdrawn";
    }
  ) => Promise<unknown>;
  onUploadAttachment: (
    candidateId: string,
    payload: {
      fileName: string;
      contentBase64: string;
      contentType?: string;
    }
  ) => Promise<unknown>;
}) {
  const eligibleExperiments = useMemo(
    () =>
      props.experiments.filter(
        (experiment) =>
          experiment.class === "approved_training_kit" &&
          experiment.unresolvedBlockingFlagCount === 0
      ),
    [props.experiments]
  );

  const [experimentId, setExperimentId] = useState("");
  const [packageLabel, setPackageLabel] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [includedFiles, setIncludedFiles] = useState("");
  const [includedScenarios, setIncludedScenarios] = useState("");
  const [includedConfigs, setIncludedConfigs] = useState("{}");
  const [presetId, setPresetId] = useState<(typeof PACKAGING_PRESETS)[number]["id"]>("operator-kit");
  const [boundaryStatement, setBoundaryStatement] = useState(
    "This kit provides training configuration, scenario sets, and source library files for cultivating an operator-style agent. It does not transfer a specific agent identity, accumulated session context, behavioral drift history, or any persistent digital being. The resulting agent is the buyer's responsibility to configure, review, and govern."
  );
  const [sourceType, setSourceType] = useState<TrainerExperimentSourceType>("document");
  const [sourceId, setSourceId] = useState("");
  const [sourcePath, setSourcePath] = useState("");
  const [sourceNotes, setSourceNotes] = useState("");
  const [uploadingCandidateId, setUploadingCandidateId] = useState<string | null>(null);

  const selectedExperimentSummary = useMemo(
    () => eligibleExperiments.find((experiment) => experiment.id === experimentId) ?? null,
    [eligibleExperiments, experimentId]
  );

  const selectedExperimentDetail = useMemo(
    () =>
      props.selectedExperiment?.id === experimentId
        ? props.selectedExperiment
        : null,
    [props.selectedExperiment, experimentId]
  );

  function applyPreset(nextPresetId: (typeof PACKAGING_PRESETS)[number]["id"]) {
    const preset = PACKAGING_PRESETS.find((entry) => entry.id === nextPresetId);
    if (!preset) {
      return;
    }

    setPresetId(nextPresetId);
    setPackageLabel(
      selectedExperimentSummary ? `${selectedExperimentSummary.title} — ${preset.label}` : preset.label
    );
    setPackageDescription(
      selectedExperimentSummary
        ? `${preset.description} Source experiment: ${selectedExperimentSummary.title}. Purpose: ${selectedExperimentSummary.purpose}`
        : preset.description
    );
    setIncludedConfigs(
      JSON.stringify(
        {
          ...preset.includedConfigs,
          experimentSlug: selectedExperimentSummary?.slug ?? null,
          domain: selectedExperimentSummary?.domain ?? null,
          embodimentProfileSlug: selectedExperimentSummary?.embodimentProfileSlug ?? null,
        },
        null,
        2
      )
    );
    setBoundaryStatement(preset.boundaryStatement);
  }

  function handleExperimentChange(nextExperimentId: string) {
    setExperimentId(nextExperimentId);
    void props.onSelectExperiment(nextExperimentId);

    if (packageLabel.trim() || packageDescription.trim()) {
      return;
    }

    const nextExperiment = eligibleExperiments.find((experiment) => experiment.id === nextExperimentId);
    const preset = PACKAGING_PRESETS.find((entry) => entry.id === presetId);
    if (!nextExperiment || !preset) {
      return;
    }

    setPackageLabel(`${nextExperiment.title} — ${preset.label}`);
    setPackageDescription(`${preset.description} Source experiment: ${nextExperiment.title}. Purpose: ${nextExperiment.purpose}`);
    setIncludedConfigs(
      JSON.stringify(
        {
          ...preset.includedConfigs,
          experimentSlug: nextExperiment.slug,
          domain: nextExperiment.domain ?? null,
          embodimentProfileSlug: nextExperiment.embodimentProfileSlug ?? null,
        },
        null,
        2
      )
    );
  }

  function applyExperimentAttachments() {
    if (!selectedExperimentDetail) {
      return;
    }

    const nextIncludedFiles = Array.from(
      new Set(
        selectedExperimentDetail.sources
          .filter((source) => source.sourceType !== "scenario_set")
          .map((source) => source.sourcePath?.trim() || source.sourceId.trim())
          .filter(Boolean)
      )
    );
    const nextIncludedScenarios = Array.from(
      new Set(
        selectedExperimentDetail.sources
          .filter((source) => source.sourceType === "scenario_set")
          .map((source) => source.sourceId.trim())
          .filter(Boolean)
      )
    );

    setIncludedFiles(nextIncludedFiles.join(", "));
    setIncludedScenarios(nextIncludedScenarios.join(", "));
  }

  async function handleAttachSource() {
    if (!selectedExperimentDetail || !sourceId.trim()) {
      return;
    }

    await props.onAttachSource(selectedExperimentDetail.id, {
      sourceType,
      sourceId: sourceId.trim(),
      sourcePath: sourcePath.trim() || undefined,
      notes: sourceNotes.trim() || undefined,
    });

    setSourceId("");
    setSourcePath("");
    setSourceNotes("");
  }

  async function handleUploadAttachment(candidateId: string, file: File | null) {
    if (!file) {
      return;
    }

    setUploadingCandidateId(candidateId);

    try {
      const contentBase64 = await readFileAsBase64(file);
      await props.onUploadAttachment(candidateId, {
        fileName: file.name,
        contentBase64,
        contentType: file.type || undefined,
      });
    } finally {
      setUploadingCandidateId(null);
    }
  }

  async function handleNominate() {
    const parsedConfigs = includedConfigs.trim() ? JSON.parse(includedConfigs) : {};

    await props.onNominate({
      experimentId,
      packageLabel,
      packageDescription,
      includedFiles: includedFiles
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      includedScenarios: includedScenarios
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      includedConfigs:
        parsedConfigs && typeof parsedConfigs === "object" && !Array.isArray(parsedConfigs)
          ? (parsedConfigs as Record<string, unknown>)
          : null,
      boundaryStatement,
    });
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-950/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageOpen className="size-4 text-cyan-300" />
            Packaging Gate
          </CardTitle>
          <CardDescription>
            Explicit founder packaging only. Kits are reproducible training bundles, never transferable identities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {props.error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {props.error}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Preset</label>
              <div className="flex gap-2">
                <Select value={presetId} onValueChange={(value) => setPresetId(value as typeof presetId)}>
                  <SelectTrigger className="border-slate-600 bg-slate-800/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGING_PRESETS.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  disabled={props.isMutating}
                  onClick={() => applyPreset(presetId)}
                >
                  Load preset
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Experiment</label>
              <Select value={experimentId} onValueChange={handleExperimentChange}>
                <SelectTrigger className="border-slate-600 bg-slate-800/60">
                  <SelectValue placeholder="Choose an eligible experiment" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleExperiments.map((experiment) => (
                    <SelectItem key={experiment.id} value={experiment.id}>
                      {experiment.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Package label</label>
              <Input
                value={packageLabel}
                onChange={(event) => setPackageLabel(event.target.value)}
                className="border-slate-600 bg-slate-800/60"
                placeholder="Operator Training Kit"
              />
            </div>
          </div>

          {selectedExperimentDetail ? (
            <div className="space-y-4 rounded-2xl border border-slate-700/40 bg-slate-900/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-white">Experiment attachments</p>
                  <p className="text-xs text-slate-400">
                    Pull attached sources straight into the package manifest or add missing ones here.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={props.isMutating || selectedExperimentDetail.sources.length === 0}
                  onClick={applyExperimentAttachments}
                >
                  Use experiment attachments
                </Button>
              </div>

              {selectedExperimentDetail.sources.length > 0 ? (
                <div className="space-y-2">
                  {selectedExperimentDetail.sources.map((source) => (
                    <div
                      key={source.id}
                      className="rounded-xl border border-slate-700/40 bg-slate-950/40 px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="font-medium uppercase tracking-wide text-slate-300">
                          {source.sourceType.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono text-slate-500">{source.sourceId}</span>
                      </div>
                      {source.sourcePath ? (
                        <p className="mt-1 font-mono text-xs text-slate-500">{source.sourcePath}</p>
                      ) : null}
                      {source.notes ? (
                        <p className="mt-1 text-xs text-slate-400">{source.notes}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-700/40 bg-slate-950/40 px-3 py-4 text-sm text-slate-400">
                  No sources attached to this experiment yet.
                </div>
              )}

              <div className="grid gap-3 lg:grid-cols-[0.8fr_1fr_1fr]">
                <Select value={sourceType} onValueChange={(value) => setSourceType(value as TrainerExperimentSourceType)}>
                  <SelectTrigger className="border-slate-600 bg-slate-800/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="scenario_set">Scenario set</SelectItem>
                    <SelectItem value="run_output">Run output</SelectItem>
                    <SelectItem value="spec_file">Spec file</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={sourceId}
                  onChange={(event) => setSourceId(event.target.value)}
                  className="border-slate-600 bg-slate-800/60 text-sm"
                  placeholder="Document id, scenario set id, or run id"
                />
                <Input
                  value={sourcePath}
                  onChange={(event) => setSourcePath(event.target.value)}
                  className="border-slate-600 bg-slate-800/60 text-sm"
                  placeholder="Optional source path"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Textarea
                  rows={2}
                  value={sourceNotes}
                  onChange={(event) => setSourceNotes(event.target.value)}
                  className="min-h-[76px] flex-1 border-slate-600 bg-slate-800/60 text-sm"
                  placeholder="Optional notes for the package/source link"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={props.isMutating || !sourceId.trim()}
                  onClick={() => void handleAttachSource()}
                >
                  <Link2 className="mr-2 size-4" />
                  Attach source
                </Button>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Package description</label>
            <Textarea
              rows={3}
              value={packageDescription}
              onChange={(event) => setPackageDescription(event.target.value)}
              className="border-slate-600 bg-slate-800/60 text-sm"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Included files</label>
              <Textarea
                rows={3}
                value={includedFiles}
                onChange={(event) => setIncludedFiles(event.target.value)}
                className="border-slate-600 bg-slate-800/60 text-sm"
                placeholder="document-id-1, document-id-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Included scenarios</label>
              <Textarea
                rows={3}
                value={includedScenarios}
                onChange={(event) => setIncludedScenarios(event.target.value)}
                className="border-slate-600 bg-slate-800/60 text-sm"
                placeholder="scenario-set-id-1, scenario-set-id-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Included configs JSON</label>
            <Textarea
              rows={4}
              value={includedConfigs}
              onChange={(event) => setIncludedConfigs(event.target.value)}
              className="border-slate-600 bg-slate-800/60 font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Boundary statement</label>
            <Textarea
              rows={5}
              value={boundaryStatement}
              onChange={(event) => setBoundaryStatement(event.target.value)}
              className="border-emerald-500/20 bg-slate-800/60 text-sm"
            />
          </div>

          <Button
            className="bg-cyan-600 hover:bg-cyan-500"
            disabled={props.isMutating || !experimentId || !boundaryStatement.trim()}
            onClick={() => void handleNominate()}
          >
            Nominate for packaging
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-950/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="size-4 text-emerald-300" />
            Packaging Candidates
          </CardTitle>
          <CardDescription>
            Boundary statements stay visible at the point of approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[420px]">
            <div className="space-y-4">
              {props.candidates.map((candidate) => {
                const attachments = readPackagingAttachments(candidate);

                return (
                  <div key={candidate.id} className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{candidate.packageLabel}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {candidate.experiment?.title ?? candidate.experimentId}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("border", STATUS_STYLES[candidate.status])}
                    >
                      {candidate.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-200">{candidate.packageDescription}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                    <span>{candidate.includedFiles.length} files</span>
                    <span>{candidate.includedScenarios.length} scenarios</span>
                    {attachments.length ? <span>{attachments.length} uploads</span> : null}
                  </div>
                  <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-100">
                    {candidate.boundaryStatement}
                  </div>
                  {attachments.length > 0 ? (
                    <div className="mt-3 space-y-2 rounded-xl border border-slate-700/40 bg-slate-950/30 px-3 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Uploaded package attachments
                      </p>
                      {attachments.map((attachment) => (
                        <div key={attachment.storagePath} className="rounded-lg border border-slate-700/40 bg-slate-900/40 px-3 py-2">
                          <div className="flex flex-wrap items-center gap-2 text-sm text-white">
                            <span>{attachment.fileName}</span>
                            <Badge
                              variant="outline"
                              className="border-slate-700 bg-slate-950/60 text-slate-300"
                            >
                              {formatBytes(attachment.byteSize)}
                            </Badge>
                            {attachment.contentType ? (
                              <Badge
                                variant="outline"
                                className="border-slate-700 bg-slate-950/60 text-slate-300"
                              >
                                {attachment.contentType}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 font-mono text-xs text-slate-500">{attachment.storagePath}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-3 space-y-2 rounded-xl border border-slate-700/40 bg-slate-950/30 px-3 py-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Upload className="size-4 text-cyan-300" />
                      Upload KB or memory artifact
                    </div>
                    <Input
                      type="file"
                      disabled={props.isMutating || uploadingCandidateId === candidate.id}
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        event.currentTarget.value = "";
                        void handleUploadAttachment(candidate.id, file);
                      }}
                      className="border-slate-600 bg-slate-800/60 text-sm file:text-slate-200"
                    />
                    <p className="text-xs text-slate-500">
                      Uploads land in private trainer package storage and are registered on the candidate. Current limit: 3 MB per file.
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {candidate.status === "candidate" ? (
                      <Button
                        size="sm"
                        className="bg-emerald-700 hover:bg-emerald-600"
                        disabled={props.isMutating}
                        onClick={() =>
                          void props.onUpdateCandidate(candidate.id, {
                            status: "kit_approved",
                          })
                        }
                      >
                        <PackageCheck className="mr-1.5 size-3.5" />
                        Approve kit
                      </Button>
                    ) : null}
                    {candidate.status === "kit_approved" ? (
                      <Button
                        size="sm"
                        className="bg-cyan-700 hover:bg-cyan-600"
                        disabled={props.isMutating}
                        onClick={() =>
                          void props.onUpdateCandidate(candidate.id, {
                            status: "shipped",
                          })
                        }
                      >
                        <Archive className="mr-1.5 size-3.5" />
                        Mark shipped
                      </Button>
                    ) : null}
                    {candidate.status !== "withdrawn" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={props.isMutating}
                        onClick={() =>
                          void props.onUpdateCandidate(candidate.id, {
                            status: "withdrawn",
                          })
                        }
                      >
                        Withdraw
                      </Button>
                    ) : null}
                  </div>
                  </div>
                );
              })}

              {props.candidates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 px-4 py-10 text-center text-sm text-slate-400">
                  No packaging candidates yet.
                </div>
              ) : null}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
