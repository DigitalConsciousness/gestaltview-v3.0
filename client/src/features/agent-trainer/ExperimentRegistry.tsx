import { useEffect, useState } from "react";
import {
  FlaskConical,
  History,
  Link2,
  Play,
  ShieldAlert,
  Tags,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import type {
  TrainerExperimentDetail,
  TrainerExperimentSourceType,
  TrainerExperimentSummary,
  TrainerPolicyFlagName,
  TrainerPolicyFlagSeverity,
} from "@shared/agent-trainer/schemas";

import { ExperimentForm } from "./ExperimentForm";
import { PolicyFlagBadge } from "./PolicyFlagBadge";

const CLASS_STYLES: Record<string, string> = {
  operational_profile: "border-cyan-500/40 bg-cyan-500/10 text-cyan-100",
  approved_training_kit: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
  rejected: "border-rose-500/40 bg-rose-500/10 text-rose-100",
};

const FLAG_OPTIONS: Array<{ value: TrainerPolicyFlagName; label: string }> = [
  { value: "persona-risk", label: "Persona risk" },
  { value: "memory-risk", label: "Memory risk" },
  { value: "overattachment-risk", label: "Overattachment risk" },
  { value: "claims-risk", label: "Claims risk" },
  { value: "charisma-artifact", label: "Charisma artifact" },
  { value: "scope-creep", label: "Scope creep" },
];

export function ExperimentRegistry(props: {
  experiments: TrainerExperimentSummary[];
  selectedExperiment: TrainerExperimentDetail | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  onCreateExperiment: Parameters<typeof ExperimentForm>[0]["onSubmit"];
  onSelectExperiment: (experimentId: string) => Promise<unknown>;
  onStartTrainingRun: (experiment: TrainerExperimentDetail) => void;
  onAttachSource: (
    experimentId: string,
    payload: {
      sourceType: TrainerExperimentSourceType;
      sourceId: string;
      sourcePath?: string;
      notes?: string;
    }
  ) => Promise<unknown>;
  onCreateFlag: (
    experimentId: string,
    payload: {
      flag: TrainerPolicyFlagName;
      severity: TrainerPolicyFlagSeverity;
      notes?: string;
    }
  ) => Promise<unknown>;
  onUpdateExperiment: (
    experimentId: string,
    payload: {
      class: TrainerExperimentSummary["class"];
      packagingEligible: boolean;
    }
  ) => Promise<unknown>;
}) {
  const [sourceType, setSourceType] = useState<TrainerExperimentSourceType>("document");
  const [sourceId, setSourceId] = useState("");
  const [sourcePath, setSourcePath] = useState("");
  const [sourceNotes, setSourceNotes] = useState("");
  const [flagName, setFlagName] = useState<TrainerPolicyFlagName>("persona-risk");
  const [flagSeverity, setFlagSeverity] = useState<TrainerPolicyFlagSeverity>("advisory");
  const [flagNotes, setFlagNotes] = useState("");
  const [selectedClass, setSelectedClass] =
    useState<TrainerExperimentSummary["class"]>("operational_profile");
  const [packagingEligible, setPackagingEligible] = useState(false);

  useEffect(() => {
    if (!props.selectedExperiment) {
      return;
    }

    setSelectedClass(props.selectedExperiment.class);
    setPackagingEligible(props.selectedExperiment.packagingEligible);
  }, [props.selectedExperiment]);

  return (
    <div className="space-y-6">
      <ExperimentForm isSubmitting={props.isMutating} onSubmit={props.onCreateExperiment} />

      <Card className="border-slate-700/50 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FlaskConical className="size-4 text-cyan-300" />
            Experiment Registry
          </CardTitle>
          <CardDescription>
            Govern profiles, sources, reviews, and policy flags before any packaging decision.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-3">
            {props.error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {props.error}
              </div>
            ) : null}

            <ScrollArea className="h-[420px] rounded-2xl border border-slate-700/50 bg-slate-950/40 p-3">
              <div className="space-y-3">
                {props.experiments.map((experiment) => (
                  <button
                    key={experiment.id}
                    type="button"
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition-colors",
                      props.selectedExperiment?.id === experiment.id
                        ? "border-cyan-400/40 bg-cyan-500/10"
                        : "border-slate-700/40 bg-slate-900/50 hover:border-slate-500/50"
                    )}
                    onClick={() => void props.onSelectExperiment(experiment.id)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-white">{experiment.title}</span>
                      <Badge
                        variant="outline"
                        className={cn("border", CLASS_STYLES[experiment.class])}
                      >
                        {experiment.class.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{experiment.purpose}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span>{experiment.sourceCount} sources</span>
                      <span>{experiment.reviewCount} reviews</span>
                      <span>{experiment.unresolvedBlockingFlagCount} blocking flags</span>
                    </div>
                  </button>
                ))}

                {!props.isLoading && props.experiments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-8 text-center text-sm text-slate-400">
                    No experiments recorded yet.
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
            {props.selectedExperiment ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{props.selectedExperiment.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{props.selectedExperiment.purpose}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-500"
                    onClick={() => props.onStartTrainingRun(props.selectedExperiment!)}
                  >
                    <Play className="mr-1.5 size-3.5" />
                    Start Training Run
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">Class</label>
                    <Select
                      value={selectedClass}
                      onValueChange={(value) =>
                        setSelectedClass(value as TrainerExperimentSummary["class"])
                      }
                    >
                      <SelectTrigger className="border-slate-600 bg-slate-800/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operational_profile">Operational profile</SelectItem>
                        <SelectItem value="approved_training_kit">Approved training kit</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3">
                      <Checkbox
                        id="experiment-packaging-eligible"
                        checked={packagingEligible}
                        onCheckedChange={(value) => setPackagingEligible(value === true)}
                      />
                      <label
                        htmlFor="experiment-packaging-eligible"
                        className="text-sm text-slate-300"
                      >
                        Packaging eligible
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  disabled={props.isMutating}
                  onClick={() =>
                    void props.onUpdateExperiment(props.selectedExperiment!.id, {
                      class: selectedClass,
                      packagingEligible,
                    })
                  }
                >
                  Save governance state
                </Button>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3 rounded-2xl border border-slate-700/40 bg-slate-900/40 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Link2 className="size-4 text-cyan-300" />
                      Attach source
                    </div>
                    <Select
                      value={sourceType}
                      onValueChange={(value) => setSourceType(value as TrainerExperimentSourceType)}
                    >
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
                    <Textarea
                      rows={2}
                      value={sourceNotes}
                      onChange={(event) => setSourceNotes(event.target.value)}
                      className="border-slate-600 bg-slate-800/60 text-sm"
                      placeholder="Optional notes"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={props.isMutating || !sourceId.trim()}
                      onClick={() =>
                        void props.onAttachSource(props.selectedExperiment!.id, {
                          sourceType,
                          sourceId,
                          sourcePath: sourcePath || undefined,
                          notes: sourceNotes || undefined,
                        })
                      }
                    >
                      Attach source
                    </Button>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-slate-700/40 bg-slate-900/40 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <ShieldAlert className="size-4 text-amber-300" />
                      Add policy flag
                    </div>
                    <Select
                      value={flagName}
                      onValueChange={(value) => setFlagName(value as TrainerPolicyFlagName)}
                    >
                      <SelectTrigger className="border-slate-600 bg-slate-800/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FLAG_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={flagSeverity}
                      onValueChange={(value) =>
                        setFlagSeverity(value as TrainerPolicyFlagSeverity)
                      }
                    >
                      <SelectTrigger className="border-slate-600 bg-slate-800/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="advisory">Advisory</SelectItem>
                        <SelectItem value="blocking">Blocking</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      rows={2}
                      value={flagNotes}
                      onChange={(event) => setFlagNotes(event.target.value)}
                      className="border-slate-600 bg-slate-800/60 text-sm"
                      placeholder="Why this flag matters"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={props.isMutating}
                      onClick={() =>
                        void props.onCreateFlag(props.selectedExperiment!.id, {
                          flag: flagName,
                          severity: flagSeverity,
                          notes: flagNotes || undefined,
                        })
                      }
                    >
                      Add policy flag
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="space-y-2 rounded-2xl border border-slate-700/40 bg-slate-900/40 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Link2 className="size-4 text-cyan-300" />
                      Sources
                    </div>
                    <div className="space-y-2 text-sm text-slate-300">
                      {props.selectedExperiment.sources.map((source) => (
                        <div key={source.id} className="rounded-xl border border-slate-700/40 px-3 py-2">
                          <p className="font-mono text-xs text-slate-200">{source.sourceId}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {source.sourceType}
                            {source.sourcePath ? ` · ${source.sourcePath}` : ""}
                          </p>
                        </div>
                      ))}
                      {props.selectedExperiment.sources.length === 0 ? (
                        <p className="text-xs text-slate-500">No sources attached yet.</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-slate-700/40 bg-slate-900/40 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Tags className="size-4 text-amber-300" />
                      Policy Flags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {props.selectedExperiment.flags.map((flag) => (
                        <PolicyFlagBadge key={flag.id} flag={flag} />
                      ))}
                      {props.selectedExperiment.flags.length === 0 ? (
                        <p className="text-xs text-slate-500">No flags logged yet.</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-slate-700/40 bg-slate-900/40 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <History className="size-4 text-emerald-300" />
                      Review History
                    </div>
                    <div className="space-y-2 text-sm text-slate-300">
                      {props.selectedExperiment.reviews.slice(0, 5).map((review) => (
                        <div key={review.id} className="rounded-xl border border-slate-700/40 px-3 py-2">
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            {review.decision.replace(/_/g, " ")}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{review.notes}</p>
                        </div>
                      ))}
                      {props.selectedExperiment.reviews.length === 0 ? (
                        <p className="text-xs text-slate-500">No review history yet.</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 px-4 py-10 text-center text-sm text-slate-400">
                Select an experiment to inspect sources, flags, and review history.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
