import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildDashboardOverview } from "@/lib/dashboardOverview";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-06-12T12:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("dashboard overview helper", () => {
  it("builds greeting, KPI cards, and recent activity from live data", () => {
    const overview = buildDashboardOverview({
      email: "keith@example.test",
      displayName: "Keith",
      memoryEntries: [
        {
          id: "memory-2",
          scope: "session",
          kind: "insight",
          title: "Blackboard recap",
          summary: "Session recap sent to Dynamic Inner World.",
          content: "Session recap sent to Dynamic Inner World.",
          created_at: "2026-06-11T12:00:00.000Z",
          updated_at: "2026-06-12T10:00:00.000Z",
        },
        {
          id: "memory-1",
          scope: "personal",
          kind: "note",
          title: null,
          summary: null,
          content: "Remember to keep weaving the threads.",
          created_at: "2026-06-10T12:00:00.000Z",
          updated_at: "2026-06-10T12:30:00.000Z",
        },
      ],
      runtimeArtifactCounts: {
        queued: 1,
        approved: 2,
        saved: 3,
        innerWorld: 4,
        blueprints: 5,
        totalCaptures: 10,
      },
      activeModuleCount: 7,
      founderLastSessionAt: "2026-06-12T09:00:00.000Z",
    });

    expect(overview.greeting).toBe("Welcome back, Keith");
    expect(overview.metrics).toMatchObject([
      { label: "Sessions this week", value: "1" },
      { label: "Artifacts created", value: "10" },
      { label: "Active modules", value: "7" },
    ]);
    expect(overview.recentActivity[0]).toMatchObject({
      id: "memory-2",
      title: "Blackboard recap",
      badge: "session · insight",
      when: "2h ago",
    });
    expect(overview.hasActivity).toBe(true);
  });

  it("marks empty activity clearly when there are no entries", () => {
    const overview = buildDashboardOverview({
      email: "guest@example.test",
      memoryEntries: [],
      runtimeArtifactCounts: {
        queued: 0,
        approved: 0,
        saved: 0,
        innerWorld: 0,
        blueprints: 0,
        totalCaptures: 0,
      },
      activeModuleCount: 0,
    });

    expect(overview.greeting).toBe("Welcome back, guest");
    expect(overview.recentActivity).toHaveLength(0);
    expect(overview.hasActivity).toBe(false);
  });
});
