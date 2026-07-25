import type { KitTierName } from "../config/tiers";
import {
  activationMilestones,
  analyticsSignals,
  corpusTargets,
  workspaceReadinessReport
} from "../config/trainerBlueprint";
import {
  ProgressTrack,
  Surface,
  Tag,
  autoGridStyle,
  glassCardStyle,
  subtleTextStyle
} from "./kitPrimitives";
import { TierGate } from "./TierGate";

interface AnalyticsDashboardProps {
  tier: KitTierName;
}

export function AnalyticsDashboard({ tier }: AnalyticsDashboardProps) {
  return (
    <TierGate tier={tier} feature="analyticsDashboard">
      <Surface
        eyebrow="Analytics + Eval"
        title="Quality Signals"
        description="The analytics layer should show where the system is strong, where it is thin, and which uploads create the fastest quality gains before go-live."
      >
        <div style={autoGridStyle}>
          <div style={glassCardStyle}>
            <Tag tone="accent">Go-live readiness</Tag>
            <strong style={{ fontSize: "2rem" }}>{workspaceReadinessReport.overallScore}%</strong>
            <p style={subtleTextStyle}>
              Verdict: {workspaceReadinessReport.goLiveVerdict.replace("_", " ")}.
            </p>
          </div>
          <div style={glassCardStyle}>
            <Tag tone="warm">Activation milestones</Tag>
            <strong style={{ fontSize: "2rem" }}>
              {activationMilestones.filter((milestone) => milestone.completed).length}/
              {activationMilestones.length}
            </strong>
            <p style={subtleTextStyle}>
              Measures setup completion, evaluation coverage, and publish readiness.
            </p>
          </div>
        </div>
        <div style={autoGridStyle}>
          {analyticsSignals.map((signal) => (
            <div key={signal.label} style={glassCardStyle}>
              <Tag tone={signal.label === "Weak zone" ? "warm" : "accent"}>
                {signal.label}
              </Tag>
              <strong style={{ fontSize: "1.05rem" }}>{signal.value}</strong>
              <p style={subtleTextStyle}>{signal.detail}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {corpusTargets.map((target) => (
            <ProgressTrack
              key={target.lane}
              label={`${target.shortLabel} lane readiness`}
              value={target.readinessPercent}
              tone={target.lane === "product" ? "warm" : "accent"}
            />
          ))}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {activationMilestones.map((milestone) => (
            <div key={milestone.label} style={glassCardStyle}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <Tag tone={milestone.completed ? "accent" : "warm"}>
                  {milestone.completed ? "Complete" : "Open"}
                </Tag>
                <strong>{milestone.label}</strong>
              </div>
              <p style={subtleTextStyle}>{milestone.detail}</p>
            </div>
          ))}
        </div>
      </Surface>
    </TierGate>
  );
}
