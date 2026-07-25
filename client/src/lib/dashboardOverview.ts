import type { RuntimeArtifactCounts } from "@/lib/artifact";

export type DashboardMemoryEntry = {
  id: string;
  scope: "personal" | "session" | "shared";
  kind: "identity" | "preference" | "goal" | "project" | "relationship" | "constraint" | "insight" | "note";
  title: string | null;
  summary: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

export type DashboardOverviewMetric = {
  label: string;
  value: string;
  detail: string;
};

export type DashboardOverviewActivity = {
  id: string;
  title: string;
  summary: string;
  badge: string;
  when: string;
};

export type DashboardOverviewInput = {
  email: string;
  displayName?: string | null;
  memoryEntries: DashboardMemoryEntry[];
  runtimeArtifactCounts: RuntimeArtifactCounts;
  activeModuleCount: number;
  founderLastSessionAt?: string | null;
};

export type DashboardOverview = {
  greeting: string;
  metrics: DashboardOverviewMetric[];
  recentActivity: DashboardOverviewActivity[];
  hasActivity: boolean;
};

function formatRelativeTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "recently";
  }

  const deltaMs = Date.now() - parsed.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (deltaMs < minute) return "just now";
  if (deltaMs < hour) return `${Math.max(1, Math.round(deltaMs / minute))}m ago`;
  if (deltaMs < day) return `${Math.max(1, Math.round(deltaMs / hour))}h ago`;
  return `${Math.max(1, Math.round(deltaMs / day))}d ago`;
}

function trimText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function sortByUpdatedAt(entries: DashboardMemoryEntry[]): DashboardMemoryEntry[] {
  return [...entries].sort((left, right) => {
    const rightTime = Date.parse(right.updated_at || right.created_at);
    const leftTime = Date.parse(left.updated_at || left.created_at);
    return rightTime - leftTime;
  });
}

function countRecentSessions(entries: DashboardMemoryEntry[]): number {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return entries.filter((entry) => {
    if (entry.scope !== "session") {
      return false;
    }

    const stamp = Date.parse(entry.updated_at || entry.created_at);
    return !Number.isNaN(stamp) && stamp >= sevenDaysAgo;
  }).length;
}

export function buildDashboardOverview(input: DashboardOverviewInput): DashboardOverview {
  const displayName = input.displayName?.trim() || input.email.split("@")[0] || "Collaborator";
  const greeting = `Welcome back, ${displayName}`;
  const recentSessions = countRecentSessions(input.memoryEntries);
  const recentActivity = sortByUpdatedAt(input.memoryEntries).slice(0, 5).map((entry) => ({
    id: entry.id,
    title: entry.title?.trim() || entry.kind,
    summary: trimText(entry.summary?.trim() || entry.content, 110),
    badge: `${entry.scope} · ${entry.kind}`,
    when: formatRelativeTime(entry.updated_at || entry.created_at),
  }));

  return {
    greeting,
    metrics: [
      {
        label: "Sessions this week",
        value: String(recentSessions),
        detail: "Recent session memories within the last 7 days",
      },
      {
        label: "Artifacts created",
        value: String(input.runtimeArtifactCounts.totalCaptures),
        detail: `${input.runtimeArtifactCounts.blueprints} blueprints · ${input.runtimeArtifactCounts.innerWorld} inner world`,
      },
      {
        label: "Active modules",
        value: String(input.activeModuleCount),
        detail: "Primary launch surfaces currently linked from Dashboard",
      },
    ],
    recentActivity,
    hasActivity: recentActivity.length > 0,
  };
}
