import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, Calendar, Plus, Users, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/GlassCard";

type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

type Workspace = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  member_count: number;
  role: WorkspaceRole;
  recent_activity: string;
};

interface WorkspacesInterfaceProps {
  userId: string;
}

function getWorkspaceStorageKey(userId: string): string {
  return `gv.workspaces.local.${userId}`;
}

function readLocalWorkspaces(userId: string): Workspace[] {
  try {
    const raw = window.localStorage.getItem(getWorkspaceStorageKey(userId));
    return raw ? (JSON.parse(raw) as Workspace[]) : [];
  } catch {
    return [];
  }
}

function writeLocalWorkspaces(userId: string, workspaces: Workspace[]): void {
  try {
    window.localStorage.setItem(getWorkspaceStorageKey(userId), JSON.stringify(workspaces));
  } catch {
    // Ignore storage failures in private mode.
  }
}

function seedWorkspaces(userId: string): Workspace[] {
  const stamp = new Date().toISOString();

  return [
    {
      id: `${userId}-loom`,
      name: "Founder Loom",
      description: "Shared room for founder continuity, product decisions, and live capture.",
      created_at: stamp,
      member_count: 2,
      role: "owner",
      recent_activity: "Billy synced a new founder note.",
    },
    {
      id: `${userId}-docs`,
      name: "Document Studio",
      description: "Analysis room for files, summaries, and decision support.",
      created_at: stamp,
      member_count: 4,
      role: "admin",
      recent_activity: "A document was marked ready for review.",
    },
  ];
}

export default function WorkspacesInterface({ userId }: WorkspacesInterfaceProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRole, setEditRole] = useState<WorkspaceRole>("owner");
  const [editMemberCount, setEditMemberCount] = useState(1);
  const [editActivity, setEditActivity] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspaces() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/workspaces", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Workspace load failed (${response.status})`);
        }

        const payload = (await response.json()) as { workspaces?: Workspace[] };
        const nextWorkspaces = Array.isArray(payload.workspaces) ? payload.workspaces : [];
        if (cancelled) return;

        setWorkspaces(nextWorkspaces);
        setSelectedId(nextWorkspaces[0]?.id ?? null);
        writeLocalWorkspaces(userId, nextWorkspaces);
      } catch {
        if (cancelled) return;

        const local = readLocalWorkspaces(userId);
        const fallback = local.length > 0 ? local : seedWorkspaces(userId);
        setWorkspaces(fallback);
        setSelectedId(fallback[0]?.id ?? null);
        writeLocalWorkspaces(userId, fallback);
        setError("Workspace storage is unavailable; using local browser state.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadWorkspaces();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const selectedWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === selectedId) ?? workspaces[0] ?? null,
    [selectedId, workspaces]
  );

  useEffect(() => {
    if (!selectedWorkspace) {
      return;
    }

    setEditName(selectedWorkspace.name);
    setEditDescription(selectedWorkspace.description);
    setEditRole(selectedWorkspace.role);
    setEditMemberCount(selectedWorkspace.member_count);
    setEditActivity(selectedWorkspace.recent_activity);
  }, [selectedWorkspace]);

  const createWorkspace = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Workspace create failed (${response.status})`);
      }

      const payload = (await response.json()) as { workspace?: Workspace };
      const nextWorkspace = payload.workspace;
      if (nextWorkspace) {
        setWorkspaces((current) => {
          const next = [nextWorkspace, ...current.filter((workspace) => workspace.id !== nextWorkspace.id)];
          writeLocalWorkspaces(userId, next);
          return next;
        });
        setSelectedId(nextWorkspace.id);
      }
    } catch {
      const fallbackWorkspace: Workspace = {
        id: `${userId}-${crypto.randomUUID()}`,
        name: trimmedName,
        description: description.trim(),
        created_at: new Date().toISOString(),
        member_count: 1,
        role: "owner",
        recent_activity: "Workspace created locally in the browser.",
      };

      setWorkspaces((current) => {
        const next = [fallbackWorkspace, ...current];
        writeLocalWorkspaces(userId, next);
        return next;
      });
      setSelectedId(fallbackWorkspace.id);
      setError("Workspace storage is unavailable; the new room was kept locally.");
    } finally {
      setName("");
      setDescription("");
      setIsSaving(false);
    }
  };

  const updateWorkspace = async () => {
    if (!selectedWorkspace) {
      return;
    }

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setError("Workspace name is required.");
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/workspaces", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id: selectedWorkspace.id,
          name: trimmedName,
          description: editDescription.trim(),
          role: editRole,
          memberCount: editMemberCount,
          recentActivity: editActivity.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Workspace update failed (${response.status})`);
      }

      const payload = (await response.json()) as { workspace?: Workspace };
      if (payload.workspace) {
        setWorkspaces((current) =>
          {
            const next = current.map((workspace) => (workspace.id === payload.workspace?.id ? payload.workspace! : workspace));
            writeLocalWorkspaces(userId, next);
            return next;
          }
        );
      }
    } catch {
      const updated: Workspace = {
        ...selectedWorkspace,
        name: trimmedName,
        description: editDescription.trim(),
        role: editRole,
        member_count: editMemberCount,
        recent_activity: editActivity.trim() || selectedWorkspace.recent_activity,
      };
      setWorkspaces((current) => {
        const next = current.map((workspace) => (workspace.id === selectedWorkspace.id ? updated : workspace));
        writeLocalWorkspaces(userId, next);
        return next;
      });
      setError("Workspace storage is unavailable; changes were kept locally.");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteWorkspace = async () => {
    if (!selectedWorkspace) {
      return;
    }

    if (!window.confirm(`Delete workspace "${selectedWorkspace.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/workspaces?id=${encodeURIComponent(selectedWorkspace.id)}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Workspace delete failed (${response.status})`);
      }

      setWorkspaces((current) => {
        const next = current.filter((workspace) => workspace.id !== selectedWorkspace.id);
        setSelectedId(next[0]?.id ?? null);
        writeLocalWorkspaces(userId, next);
        return next;
      });
    } catch {
      setWorkspaces((current) => {
        const next = current.filter((workspace) => workspace.id !== selectedWorkspace.id);
        setSelectedId(next[0]?.id ?? null);
        writeLocalWorkspaces(userId, next);
        return next;
      });
      setError("Workspace storage is unavailable; the room was removed locally.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
      <GlassCard glow="cyan" intensity="high" className="p-5 md:p-6" hover={false}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00E5FF]">Workspaces</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Your collaboration rooms</h2>
          </div>
          <Badge className="border border-[#00E5FF]/25 bg-[#00E5FF]/10 text-[#D7FBFF]">
            {workspaces.length} rooms
          </Badge>
        </div>

        <div className="mt-5 space-y-3">
          {error ? (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {error}
            </div>
          ) : null}
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.24em] text-white/35">Workspace name</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="New workspace"
              className="border-white/10 bg-black/25 text-white placeholder:text-white/25"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.24em] text-white/35">Description</span>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What will this room hold?"
              rows={4}
              className="border-white/10 bg-black/25 text-white placeholder:text-white/25"
            />
          </label>
          <Button
            type="button"
            onClick={() => void createWorkspace()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/25 bg-[#00E5FF]/12 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            {isSaving ? "Saving..." : "Create workspace"}
          </Button>
        </div>

        <div className="mt-6 space-y-3">
          {isLoading ? (
            <p className="text-sm text-white/55">Loading saved workspaces…</p>
          ) : workspaces.length === 0 ? (
            <p className="text-sm text-white/55">No workspaces saved yet.</p>
          ) : (
            workspaces.map((workspace) => (
              <Card
                key={workspace.id}
                className={`cursor-pointer border transition-colors ${
                  selectedWorkspace?.id === workspace.id
                    ? "border-[#00E5FF]/30 bg-[#00E5FF]/8"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
                onClick={() => setSelectedId(workspace.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{workspace.name}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/60">{workspace.description}</p>
                    </div>
                    <Badge className="border border-white/10 bg-black/25 text-white/70">{workspace.role}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/45">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {workspace.member_count} members
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(workspace.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </GlassCard>

      <GlassCard glow="none" intensity="medium" className="p-5 md:p-6" hover={false}>
        {selectedWorkspace ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00E5FF]">Active room</p>
                <h3 className="mt-2 text-3xl font-semibold text-white">{selectedWorkspace.name}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">{selectedWorkspace.description}</p>
              </div>
              <Badge className="border border-[#00E5FF]/25 bg-[#00E5FF]/10 text-[#D7FBFF]">
                <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                Active
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <GlassCard glow="none" intensity="low" className="p-4" hover={false}>
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">Recent activity</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{selectedWorkspace.recent_activity}</p>
              </GlassCard>
              <GlassCard glow="none" intensity="low" className="p-4" hover={false}>
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">Member count</p>
                <p className="mt-2 text-3xl font-semibold text-white">{selectedWorkspace.member_count}</p>
              </GlassCard>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Workflow className="h-4 w-4 text-[#00E5FF]" />
                Work this room can support
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Tribunal", "Docs", "Insights", "Knowledge Graph"].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/65"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">Edit room</p>
                <Badge className="border border-white/10 bg-white/[0.04] text-white/60">persisted</Badge>
              </div>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/35">Name</span>
                <Input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="border-white/10 bg-black/25 text-white placeholder:text-white/25"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/35">Description</span>
                <Textarea
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  rows={4}
                  className="border-white/10 bg-black/25 text-white placeholder:text-white/25"
                />
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.22em] text-white/35">Role</span>
                  <select
                    value={editRole}
                    onChange={(event) => setEditRole(event.target.value as WorkspaceRole)}
                    className="h-10 w-full rounded-full border border-white/10 bg-black/25 px-4 text-sm text-white outline-none"
                  >
                    <option value="owner">owner</option>
                    <option value="admin">admin</option>
                    <option value="member">member</option>
                    <option value="viewer">viewer</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.22em] text-white/35">Members</span>
                  <Input
                    type="number"
                    min={0}
                    value={editMemberCount}
                    onChange={(event) => setEditMemberCount(Number(event.target.value) || 0)}
                    className="border-white/10 bg-black/25 text-white placeholder:text-white/25"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.22em] text-white/35">Activity</span>
                  <Input
                    value={editActivity}
                    onChange={(event) => setEditActivity(event.target.value)}
                    className="border-white/10 bg-black/25 text-white placeholder:text-white/25"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => void updateWorkspace()}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/25 bg-[#00E5FF]/12 px-4 py-2 text-sm font-semibold text-white"
                >
                  {isUpdating ? "Saving..." : "Save changes"}
                </Button>
                <Button
                  type="button"
                  onClick={() => void deleteWorkspace()}
                  disabled={isDeleting}
                  variant="destructive"
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100"
                >
                  {isDeleting ? "Deleting..." : "Delete room"}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/documents"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 transition-colors hover:border-[#00E5FF]/25 hover:text-white"
              >
                Open documents
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/analytics"
                className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/25 bg-[#00E5FF]/12 px-4 py-2 text-sm font-semibold text-white"
              >
                Open analytics
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/55">Create or select a workspace to inspect its state.</p>
        )}
      </GlassCard>
    </div>
  );
}
