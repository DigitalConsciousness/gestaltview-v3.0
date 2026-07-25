import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthMock = vi.fn();
const invokeRpcMock = vi.fn();

vi.mock("../_lib/auth", () => ({
  requireAuth: requireAuthMock,
}));

vi.mock("../_lib/supabase", () => ({
  invokeRpc: invokeRpcMock,
}));

type MockRes = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string) => MockRes;
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
    end(value?: string) {
      this.body = value ? JSON.parse(value) : null;
    },
  };
}

const schemaDashboardModulePromise = import("../schema/dashboard");

describe("schema dashboard API", () => {
  beforeEach(() => {
    process.env = { ...process.env };
    vi.restoreAllMocks();
    requireAuthMock.mockReset();
    invokeRpcMock.mockReset();
  });

  it("returns the live schema snapshot for an admin session", async () => {
    const module = await schemaDashboardModulePromise;
    requireAuthMock.mockReturnValue({
      id: "admin-1",
      email: "keithsoyka@gmail.com",
      tier: "enterprise",
      isAdmin: true,
    });
    invokeRpcMock.mockResolvedValue({
      generated_at: "2026-06-28T00:00:00.000Z",
      summary: {
        public_tables: 2,
        lit_tables: 1,
        dark_tables: 1,
        vector_tables: 1,
        enum_types: 3,
      },
      tables: [
        {
          table_name: "users",
          row_count: 1,
          column_count: 3,
          foreign_key_count: 1,
          index_count: 2,
          has_rows: true,
          has_vector_index: false,
        },
      ],
    });

    const res = createRes();

    await module.default(
      { method: "GET", headers: { cookie: "gv_admin_session=token" } } as never,
      res as never,
    );

    expect(res.statusCode).toBe(200);
    expect(invokeRpcMock).toHaveBeenCalledWith("get_schema_dashboard_snapshot", {});
    expect(res.body).toMatchObject({
      summary: {
        public_tables: 2,
        lit_tables: 1,
        dark_tables: 1,
        vector_tables: 1,
        enum_types: 3,
      },
    });
  });

  it("rejects non-admin sessions before touching the RPC", async () => {
    const module = await schemaDashboardModulePromise;
    requireAuthMock.mockReturnValue({
      id: "user-1",
      email: "reader@example.com",
      tier: "free",
      isAdmin: false,
    });

    const res = createRes();

    await module.default(
      { method: "GET", headers: { cookie: "gv_admin_session=token" } } as never,
      res as never,
    );

    expect(res.statusCode).toBe(403);
    expect(invokeRpcMock).not.toHaveBeenCalled();
  });
});
