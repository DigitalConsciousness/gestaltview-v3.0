import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  TRAINER_EMBODIMENT_OPTIONS,
  type TrainerEmbodimentSlug,
} from "@shared/agent-trainer/embodiment";

const DEFAULT_STATE = {
  slug: "operator-workbench",
  title: "Operator Workbench",
  purpose: "Review specs, shape execution plans, and keep internal operational work disciplined.",
  domain: "operations",
  embodimentProfileSlug: "the-weaver" as TrainerEmbodimentSlug,
  goal: "",
  targetBehaviors: "disciplined execution, traceable reasoning, founder-aware prioritization",
  antiGoals: "persona inflation, unsupported authority, vague strategy",
  studyFocus: "",
  executionMode: "classic" as "classic" | "hyperagent",
};

export function ExperimentForm(props: {
  isSubmitting: boolean;
  onSubmit: (payload: {
    slug: string;
    title: string;
    purpose: string;
    domain: string;
    embodimentProfileSlug: string;
    goal: string;
    targetBehaviors: string[];
    antiGoals: string[];
    studyFocus: string;
    executionMode: "classic" | "hyperagent";
  }) => Promise<unknown>;
}) {
  const [form, setForm] = useState(DEFAULT_STATE);

  async function handleSubmit() {
    await props.onSubmit({
      slug: form.slug.trim(),
      title: form.title.trim(),
      purpose: form.purpose.trim(),
      domain: form.domain.trim(),
      embodimentProfileSlug: form.embodimentProfileSlug,
      goal: form.goal.trim(),
      targetBehaviors: form.targetBehaviors
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      antiGoals: form.antiGoals
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      studyFocus: form.studyFocus.trim(),
      executionMode: form.executionMode,
    });
  }

  return (
    <Card className="border-slate-700/50 bg-slate-900/60">
      <CardHeader>
        <CardTitle className="text-base">New Experiment</CardTitle>
        <CardDescription>
          Internal governance record for a profile, embodiment, or parameter set under review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Slug</label>
            <Input
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              className="border-slate-600 bg-slate-800/60 font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Title</label>
            <Input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="border-slate-600 bg-slate-800/60 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Purpose</label>
          <Textarea
            rows={3}
            value={form.purpose}
            onChange={(event) => setForm((current) => ({ ...current, purpose: event.target.value }))}
            className="border-slate-600 bg-slate-800/60 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Domain</label>
            <Select
              value={form.domain}
              onValueChange={(value) => setForm((current) => ({ ...current, domain: value }))}
            >
              <SelectTrigger className="border-slate-600 bg-slate-800/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="companion">Companion</SelectItem>
                <SelectItem value="memory-care">Memory Care</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Execution mode</label>
            <Select
              value={form.executionMode}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, executionMode: value as "classic" | "hyperagent" }))
              }
            >
              <SelectTrigger className="border-slate-600 bg-slate-800/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="hyperagent">Hyperagent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Embodiment</label>
            <Select
              value={form.embodimentProfileSlug}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  embodimentProfileSlug: value as TrainerEmbodimentSlug,
                }))
              }
            >
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
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Goal</label>
          <Textarea
            rows={3}
            value={form.goal}
            onChange={(event) => setForm((current) => ({ ...current, goal: event.target.value }))}
            className="border-slate-600 bg-slate-800/60 text-sm"
            placeholder="Concrete training objective..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Target Behaviors</label>
            <Textarea
              rows={3}
              value={form.targetBehaviors}
              onChange={(event) =>
                setForm((current) => ({ ...current, targetBehaviors: event.target.value }))
              }
              className="border-slate-600 bg-slate-800/60 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Anti-goals</label>
            <Textarea
              rows={3}
              value={form.antiGoals}
              onChange={(event) =>
                setForm((current) => ({ ...current, antiGoals: event.target.value }))
              }
              className="border-slate-600 bg-slate-800/60 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Study Focus</label>
          <Textarea
            rows={3}
            value={form.studyFocus}
            onChange={(event) =>
              setForm((current) => ({ ...current, studyFocus: event.target.value }))
            }
            className="border-slate-600 bg-slate-800/60 text-sm"
            placeholder="Optional study priorities..."
          />
        </div>

        <Button
          className="w-full bg-cyan-600 text-white hover:bg-cyan-500"
          disabled={props.isSubmitting}
          onClick={() => void handleSubmit()}
        >
          {props.isSubmitting ? "Saving experiment..." : "Create experiment"}
        </Button>
      </CardContent>
    </Card>
  );
}
