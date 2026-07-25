import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminMock = vi.fn();
const listWorkbookItemsMock = vi.fn();
const upsertWorkbookItemsMock = vi.fn();
const recordWorkbookSyncRunMock = vi.fn();

vi.mock("../_lib/auth", () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock("../../server/workbook/workbook-repository", () => ({
  listWorkbookItems: listWorkbookItemsMock,
  upsertWorkbookItems: upsertWorkbookItemsMock,
  recordWorkbookSyncRun: recordWorkbookSyncRunMock,
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
  return import("../workbook/items");
}

describe("workbook items API", () => {
  beforeEach(() => {
    requireAdminMock.mockReset();
    listWorkbookItemsMock.mockReset();
    upsertWorkbookItemsMock.mockReset();
    recordWorkbookSyncRunMock.mockReset();
    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@gestaltview.ai",
      tier: "enterprise",
      isAdmin: true,
    });
  });

  it("lists workbook rows with sheet filters", async () => {
    const module = await loadModule();
    listWorkbookItemsMock.mockResolvedValue([
      {
        id: "11111111-1111-1111-1111-111111111111",
        sheetName: "Roadmap",
        rowKey: "roadmap-founder-dashboard",
        label: "Founder Dashboard",
        category: "Product",
        status: "In Progress",
        priority: "P0",
        phase: "Now",
        owner: "Keith",
        targetStart: null,
        targetEnd: null,
        notes: null,
        linkRef: null,
        meta: {},
        createdAt: "2026-04-10T00:00:00.000Z",
        updatedAt: "2026-04-10T00:00:00.000Z",
      },
    ]);

    const req = { method: "GET", headers: {}, query: { sheet: "Roadmap" } };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(listWorkbookItemsMock).toHaveBeenCalledWith({
      sheetName: "Roadmap",
      status: undefined,
      priority: undefined,
      phase: undefined,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      items: [{ label: "Founder Dashboard" }],
    });
  });

  it("upserts workbook rows and derives a stable row key when missing", async () => {
    const module = await loadModule();
    upsertWorkbookItemsMock.mockResolvedValue([
      {
        id: "11111111-1111-1111-1111-111111111111",
        sheetName: "Roadmap",
        rowKey: "roadmap-founder-dashboard",
        label: "Founder Dashboard",
        category: null,
        status: "In Progress",
        priority: "P0",
        phase: "Now",
        owner: "Keith",
        targetStart: null,
        targetEnd: null,
        notes: null,
        linkRef: null,
        meta: {},
        createdAt: "2026-04-10T00:00:00.000Z",
        updatedAt: "2026-04-10T00:00:00.000Z",
      },
    ]);
    recordWorkbookSyncRunMock.mockResolvedValue({
      id: "22222222-2222-2222-2222-222222222222",
      triggeredBy: "manual",
      sourceFile: "Roadmap.csv",
      rowsUpserted: 1,
      rowsSkipped: 0,
      errors: [],
      status: "success",
      createdAt: "2026-04-10T00:00:00.000Z",
    });

    const req = {
      method: "POST",
      headers: {},
      body: {
        sourceFile: "Roadmap.csv",
        items: [
          {
            sheetName: "Roadmap",
            label: "Founder Dashboard",
            status: "In Progress",
            priority: "P0",
            phase: "Now",
          },
        ],
      },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(upsertWorkbookItemsMock).toHaveBeenCalledWith([
      expect.objectContaining({
        sheetName: "Roadmap",
        rowKey: "roadmap-founder-dashboard",
        label: "Founder Dashboard",
      }),
    ]);
    expect(recordWorkbookSyncRunMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceFile: "Roadmap.csv",
        rowsUpserted: 1,
        rowsSkipped: 0,
        status: "success",
      })
    );
    expect(res.statusCode).toBe(200);
  });
});
