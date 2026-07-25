import { useMemo, useState } from "react";
import { CheckCircle2, PauseCircle, ShieldAlert, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type {
  TrainerExperimentDetail,
  TrainingRunDetail,
} from "@shared/agent-trainer/schemas";

import { PolicyFlagBadge } from "./PolicyFlagBadge";

type ReviewDecision = "approved" | "rejected" | "hold" | "promote_kit";

export function ReviewQueuePanel(props: {
  currentRun: TrainingRunDetail | null;
  experiment: TrainerExperimentDetail | null;
  isSubmitting: boolean;
  deployOnApprove: boolean;
  deployPath: string;
  onDeployOnApproveChange: (nextValue: boolean) => void;
  onDeployPathChange: (nextValue: string) => void;
  onResolveFlag: (experimentId: string, flagId: string) => Promise<unknown>;
  onSubmitDecision: (
    decision: ReviewDecision,
    payload: {
      runId?: string;
      versionId?: string;
      coherenceScore?: number | null;
      safetyScore?: number | null;
      emotionalPostureScore?: number | null;
      overIdRisk?: "none" | "low" | "medium" | "high" | null;
      notes: string;
      deployOnApprove?: boolean;
      storagePath?: string;
    }
  ) => Promise<unknown>;
}) {
  const [coherenceScore, setCoherenceScore] = useState("4");
  const [safetyScore, setSafetyScore] = useState("4");
  const [emotionalPostureScore, setEmotionalPostureScore] = useState("4");
  const [overIdRisk, setOverIdRisk] = useState<"none" | "low" | "medium" | "high">("low");
  const [notes, setNotes] = useState("");

  const blockingFlags = useMemo(
    () =>
      (props.experiment?.flags ?? []).filter(
        (flag) => flag.severity === "blocking" && !flag.resolved
      ),
    [props.experiment]
  );

  if (!props.currentRun || props.currentRun.status !== "awaiting_review") {
    return null;
  }

  const latestVersion = props.currentRun.latestVersion;

  return (
    <Card className="border-violet-500/20 bg-slate-900/60">
      <CardHeader>
        <CardTitle className="text-base">Review Queue</CardTitle>
        <CardDescription>
          Record the human governance decision before promotion or packaging.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {props.experiment ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-violet-500/40 bg-violet-500/10 text-violet-100">
                {props.experiment.slug}
              </Badge>
              <Badge variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-300">
                {props.experiment.class.replace(/_/g, " ")}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-slate-200">{props.experiment.purpose}</p>
            <p className="mt-2 text-xs text-slate-500">
              Run {props.currentRun.runId}
              {latestVersion ? ` · version ${latestVersion.versionId}` : ""}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            This run is awaiting review, but no experiment is linked to it yet. Direct approve or deny
            still works for the run itself.
          </div>
        )}

        {blockingFlags.length > 0 ? (
          <div className="space-y-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-rose-100">
              <ShieldAlert className="size-4" />
              Resolve blocking flags before Approve or Promote to Kit
            </div>
            <p className="text-xs text-rose-100/80">
              Blocked by governance. An admin must resolve these flags before the run can leave the
              review queue.
            </p>
            <div className="space-y-2">
              {blockingFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/20 bg-slate-950/30 px-3 py-2"
                >
                  <PolicyFlagBadge flag={flag} />
                  {props.experiment ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void props.onResolveFlag(props.experiment!.id, flag.id)}
                    >
                      Mark resolved
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Coherence</label>
            <Input
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={coherenceScore}
              onChange={(event) => setCoherenceScore(event.target.value)}
              className="border-slate-600 bg-slate-800/60"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Safety</label>
            <Input
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={safetyScore}
              onChange={(event) => setSafetyScore(event.target.value)}
              className="border-slate-600 bg-slate-800/60"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Emotional posture</label>
            <Input
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={emotionalPostureScore}
              onChange={(event) => setEmotionalPostureScore(event.target.value)}
              className="border-slate-600 bg-slate-800/60"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Over-ID risk</label>
          <Select value={overIdRisk} onValueChange={(value) => setOverIdRisk(value as typeof overIdRisk)}>
            <SelectTrigger className="border-slate-600 bg-slate-800/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Review notes</label>
          <Textarea
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="border-slate-600 bg-slate-800/60 text-sm"
            placeholder="What passed, what failed, and what should happen next."
          />
        </div>

        <div className="space-y-3 rounded-2xl border border-lime-500/20 bg-lime-500/5 p-4">
          <label className="flex items-center gap-3 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={props.deployOnApprove}
              onChange={(event) => props.onDeployOnApproveChange(event.target.checked)}
              className="size-4 accent-lime-500"
            />
            Deploy/export immediately when approval lands
          </label>
          {props.deployOnApprove ? (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Deploy path override</label>
              <Input
                value={props.deployPath}
                onChange={(event) => props.onDeployPathChange(event.target.value)}
                className="border-slate-600 bg-slate-800/60 font-mono text-sm"
                placeholder="/agents/agent-trainer-prototype.md"
              />
              <p className="text-xs text-slate-500">
                Leave blank to let the trainer compile the default artifact path.
              </p>
            </div>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-4">
          <Button
            className="bg-emerald-700 hover:bg-emerald-600"
            disabled={props.isSubmitting || blockingFlags.length > 0 || !latestVersion?.versionId}
            onClick={() =>
              void props.onSubmitDecision("approved", {
                runId: props.currentRun?.runId,
                versionId: latestVersion?.versionId,
                coherenceScore: Number(coherenceScore) || null,
                safetyScore: Number(safetyScore) || null,
                emotionalPostureScore: Number(emotionalPostureScore) || null,
                overIdRisk,
                notes,
                deployOnApprove: props.deployOnApprove,
                storagePath: props.deployPath,
              })
            }
          >
            <CheckCircle2 className="mr-1.5 size-3.5" />
            Approve
          </Button>
          <Button
            variant="outline"
            className="border-rose-500/40 text-rose-200 hover:bg-rose-500/10"
            disabled={props.isSubmitting || !latestVersion?.versionId}
            onClick={() =>
              void props.onSubmitDecision("rejected", {
                runId: props.currentRun?.runId,
                versionId: latestVersion?.versionId,
                coherenceScore: Number(coherenceScore) || null,
                safetyScore: Number(safetyScore) || null,
                emotionalPostureScore: Number(emotionalPostureScore) || null,
                overIdRisk,
                notes,
              })
            }
          >
            <XCircle className="mr-1.5 size-3.5" />
            Deny
          </Button>
          <Button
            variant="outline"
            className="border-amber-500/40 text-amber-100 hover:bg-amber-500/10"
            disabled={props.isSubmitting || !props.experiment}
            onClick={() =>
              void props.onSubmitDecision("hold", {
                runId: props.currentRun?.runId,
                versionId: latestVersion?.versionId,
                coherenceScore: Number(coherenceScore) || null,
                safetyScore: Number(safetyScore) || null,
                emotionalPostureScore: Number(emotionalPostureScore) || null,
                overIdRisk,
                notes,
              })
            }
          >
            <PauseCircle className="mr-1.5 size-3.5" />
            Hold
          </Button>
          <Button
            className="bg-cyan-700 hover:bg-cyan-600"
            disabled={props.isSubmitting || blockingFlags.length > 0 || !props.experiment}
            onClick={() =>
              void props.onSubmitDecision("promote_kit", {
                runId: props.currentRun?.runId,
                versionId: latestVersion?.versionId,
                coherenceScore: Number(coherenceScore) || null,
                safetyScore: Number(safetyScore) || null,
                emotionalPostureScore: Number(emotionalPostureScore) || null,
                overIdRisk,
                notes,
                deployOnApprove: props.deployOnApprove,
                storagePath: props.deployPath,
              })
            }
          >
            Promote to Kit
          </Button>
        </div>

        {(props.experiment?.reviews?.length ?? 0) > 0 ? (
          <div className="space-y-2 rounded-2xl border border-slate-700/40 bg-slate-950/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Review timeline
            </p>
            <div className="space-y-2">
              {(props.experiment?.reviews ?? []).map((review) => (
                <div key={review.id} className="rounded-xl border border-slate-700/40 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {review.decision.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-sm text-slate-200">{review.notes}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
