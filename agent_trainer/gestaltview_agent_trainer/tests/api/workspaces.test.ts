import { describe, expect, it } from "vitest";
import { createWorkspaceScaffold, getWorkspaceReadiness, previewWorkspaceTheme } from "../../api/workspaces";

describe("workspace helpers", () => {
  it("creates a workspace scaffold with entitlements and theme profile", () => {
    const workspace = createWorkspaceScaffold({
      id: "workspace-1",
      organizationId: "org-1",
      name: "Demo Workspace",
      slug: "demo-workspace",
      tier: "STUDIO",
      segment: "business",
      themePresetId: "lagoon-glass"
    });

    expect(workspace.entitlements.segment).toBe("business");
    expect(workspace.themeProfile.name).toBe("Lagoon Glass");
  });

  it("scores workspace readiness across all lanes", () => {
    const readiness = getWorkspaceReadiness(
      [
        {
          lane: "knowledge",
          sourceCount: 25,
          sourceFreshness: 80,
          sourceDiversity: 80,
          evaluationPassRate: 84,
          citationCoverage: 78,
          operatorSatisfaction: 88
        },
        {
          lane: "code",
          sourceCount: 20,
          sourceFreshness: 70,
          sourceDiversity: 64,
          evaluationPassRate: 72,
          citationCoverage: 68,
          operatorSatisfaction: 74
        },
        {
          lane: "product",
          sourceCount: 18,
          sourceFreshness: 74,
          sourceDiversity: 62,
          evaluationPassRate: 71,
          citationCoverage: 67,
          operatorSatisfaction: 76
        },
        {
          lane: "context",
          sourceCount: 24,
          sourceFreshness: 86,
          sourceDiversity: 78,
          evaluationPassRate: 82,
          citationCoverage: 73,
          operatorSatisfaction: 90
        }
      ],
      [
        {
          label: "Workspace created",
          completed: true,
          detail: "done"
        },
        {
          label: "Eval suite run",
          completed: true,
          detail: "done"
        }
      ]
    );

    expect(readiness.error).toBeNull();
    expect(readiness.data?.overallScore).toBeGreaterThan(70);
    expect(readiness.data?.goLiveVerdict).toBe("ready");
  });

  it("previews a workspace theme preset", () => {
    const preview = previewWorkspaceTheme("signal-noir");
    expect(preview.data?.name).toBe("Signal Noir");
  });
});
