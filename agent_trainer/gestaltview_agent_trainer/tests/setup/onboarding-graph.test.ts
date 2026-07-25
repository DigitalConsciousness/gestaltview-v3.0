import { describe, expect, it } from "vitest";
import {
  buildOnboardingSupportBundle,
  createOnboardingSession,
  executeOnboardingTask,
  getOnboardingTaskGraph
} from "../../api/onboarding";

describe("shared onboarding graph", () => {
  it("loads a shared task graph for web and cli entry modes", () => {
    const graph = getOnboardingTaskGraph();

    expect(graph.version).toBe("1.1.0");
    expect(graph.tasks.length).toBeGreaterThanOrEqual(10);
    expect(graph.tracks.solo[0]).toBe("recommend_segment");
    expect(graph.tracks.business).toContain("stage_corpus_container");
    expect(graph.tracks.business).toContain("review_sources");
    expect(graph.tracks.enterprise).toContain("configure_governance");
  });

  it("creates and advances a cli onboarding session", () => {
    const session = createOnboardingSession({
      entryMode: "cli",
      segment: "business"
    });

    const firstStep = executeOnboardingTask(session, "recommend_segment", {
      teamSize: 6,
      sourceVolume: 120
    });

    expect(firstStep.task.status).toBe("completed");
    expect(firstStep.session.tasks.find((task) => task.taskKey === "create_workspace")?.status).toBe(
      "in_progress"
    );

    const secondStep = executeOnboardingTask(firstStep.session, "create_workspace", {
      workspace_name: "Demo Workspace",
      agent_name: "Demo Agent",
      owner_email: "ops@example.com"
    });

    expect(secondStep.task.output.workspace_status).toBe("ready");
    expect(
      secondStep.session.tasks.find((task) => task.taskKey === "stage_corpus_container")?.status
    ).toBe("in_progress");

    const thirdStep = executeOnboardingTask(secondStep.session, "stage_corpus_container", {
      repository: "demo/repo",
      default_branch: "main",
      corpus_container: ".gsvw/repo-corpus/demo-repo",
      staging_mode: "github_repo"
    });

    expect(thirdStep.task.output.container_status).toBe("ready");
    expect(
      thirdStep.session.tasks.find((task) => task.taskKey === "connect_supabase")?.status
    ).toBe("in_progress");

    const supportBundle = buildOnboardingSupportBundle(thirdStep.session);
    expect(supportBundle.segmentRecommendation).toBe("business");
    expect(supportBundle.nextTask).toBe("connect_supabase");
  });

  it("blocks source review when oversized files are detected", () => {
    const session = createOnboardingSession({
      entryMode: "cli",
      segment: "solo"
    });

    const recommendStep = executeOnboardingTask(session, "recommend_segment", {
      teamSize: 1,
      sourceVolume: 10
    });
    const workspaceStep = executeOnboardingTask(recommendStep.session, "create_workspace", {
      workspace_name: "Demo Workspace",
      agent_name: "Demo Agent"
    });
    const containerStep = executeOnboardingTask(workspaceStep.session, "stage_corpus_container", {
      repository: "demo/repo",
      corpus_container: ".gsvw/repo-corpus/demo-repo"
    });
    const providerStep = executeOnboardingTask(containerStep.session, "connect_provider", {
      provider: "groq",
      model: "llama-3.3-70b-versatile"
    });
    const reviewStep = executeOnboardingTask(providerStep.session, "review_sources", {
      review_mode: "operator-guided",
      source_count: 18,
      batch_count: 2,
      oversized_source_count: 1
    });

    expect(reviewStep.task.status).toBe("blocked");
    expect(reviewStep.task.error?.code).toBe("oversized_sources_detected");
  });
});
