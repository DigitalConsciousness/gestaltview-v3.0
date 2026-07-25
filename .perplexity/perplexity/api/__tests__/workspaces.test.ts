import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthMock = vi.fn();
const listWorkspaceRoomsMock = vi.fn();
const createWorkspaceRoomMock = vi.fn();
const updateWorkspaceRoomMock = vi.fn();
const deleteWorkspaceRoomMock = vi.fn();

vi.mock("../_lib/auth", () => ({
  requireAuth: requireAuthMock,
}));

vi.mock("../_lib/supabase", () => ({
  listWorkspaceRooms: listWorkspaceRoomsMock,
  createWorkspaceRoom: createWorkspaceRoomMock,
  updateWorkspaceRoom: updateWorkspaceRoomMock,
  deleteWorkspaceRoom: deleteWorkspaceRoomMock,
}));

type MockRes = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string) => MockRes;
  getHeader: (key: string) => string | undefined;
  end: (value?: string) => void;
};

function createRes(): MockRes {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(key: string, value: string) {
      this.headers[key] = value;
      return this;
    },
    getHeader(key: string) {
      return this.headers[key];
    },
    end(value?: string) {
      this.body = value ? JSON.parse(value) : null;
    },
  };
}

async function loadModule() {
  vi.resetModules();
  return import("../workspaces/index");
}

describe("workspaces API", () => {
  beforeEach(() => {
    requireAuthMock.mockReset();
    listWorkspaceRoomsMock.mockReset();
    createWorkspaceRoomMock.mockReset();
    updateWorkspaceRoomMock.mockReset();
    deleteWorkspaceRoomMock.mockReset();
  });

  it("lists persisted workspaces", async () => {
    const module = await loadModule();
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "keith@example.com",
      tier: "free",
      isAdmin: false,
    });
    listWorkspaceRoomsMock.mockResolvedValue([
      {
        id: "ws-1",
        user_id: "user-1",
        name: "Founder Loom",
        description: "Shared room",
        role: "owner",
        member_count: 2,
        recent_activity: "Updated today.",
        created_at: "2026-04-30T00:00:00.000Z",
        updated_at: "2026-04-30T00:00:00.000Z",
      },
    ]);

    const req = { method: "GET", headers: {}, query: {}, body: {} };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(listWorkspaceRoomsMock).toHaveBeenCalledWith("user-1");
    expect(res.body).toMatchObject({
      workspaces: [{ id: "ws-1", name: "Founder Loom" }],
    });
  });

  it("creates a workspace room", async () => {
    const module = await loadModule();
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "keith@example.com",
      tier: "free",
      isAdmin: false,
    });
    createWorkspaceRoomMock.mockResolvedValue({
      id: "ws-2",
      user_id: "user-1",
      name: "Document Studio",
      description: "Analysis room",
      role: "owner",
      member_count: 1,
      recent_activity: "Workspace created.",
      created_at: "2026-04-30T00:00:00.000Z",
      updated_at: "2026-04-30T00:00:00.000Z",
    });

    const req = {
      method: "POST",
      headers: {},
      query: {},
      body: { name: "Document Studio", description: "Analysis room" },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(createWorkspaceRoomMock).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        name: "Document Studio",
        description: "Analysis room",
      })
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      workspace: { name: "Document Studio" },
    });
  });

  it("updates a workspace room", async () => {
    const module = await loadModule();
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "keith@example.com",
      tier: "free",
      isAdmin: false,
    });
    updateWorkspaceRoomMock.mockResolvedValue({
      id: "ws-1",
      user_id: "user-1",
      name: "Updated room",
      description: "Updated description",
      role: "admin",
      member_count: 3,
      recent_activity: "Updated activity",
      created_at: "2026-04-30T00:00:00.000Z",
      updated_at: "2026-04-30T00:00:00.000Z",
    });

    const req = {
      method: "PATCH",
      headers: {},
      query: {},
      body: { id: "ws-1", name: "Updated room", memberCount: 3 },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(updateWorkspaceRoomMock).toHaveBeenCalledWith(
      "user-1",
      "ws-1",
      expect.objectContaining({
        name: "Updated room",
        member_count: 3,
      })
    );
    expect(res.statusCode).toBe(200);
  });

  it("deletes a workspace room", async () => {
    const module = await loadModule();
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "keith@example.com",
      tier: "free",
      isAdmin: false,
    });
    deleteWorkspaceRoomMock.mockResolvedValue(true);

    const req = {
      method: "DELETE",
      headers: {},
      query: { id: "ws-1" },
      body: {},
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(deleteWorkspaceRoomMock).toHaveBeenCalledWith("user-1", "ws-1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ deleted: true });
  });
});
