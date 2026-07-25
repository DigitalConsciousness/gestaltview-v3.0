import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveRenderUserId } from "../../api/render/user-id.js";

const UUID = "11111111-1111-4111-8111-111111111111";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

describe("render owner UUID resolution", () => {
  it("uses an authenticated UUID directly", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      resolveRenderUserId({ id: UUID, email: "owner@example.com" }),
    ).resolves.toBe(UUID);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps a legacy signed-session ID through the unique email profile", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "server-only-test-key";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: UUID }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      resolveRenderUserId({ id: "keith", email: "Keith@Example.com" }),
    ).resolves.toBe(UUID);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("email=eq.keith%40example.com"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer server-only-test-key",
        }),
      }),
    );
  });

  it("fails closed when legacy identity is ambiguous", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "server-only-test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    await expect(
      resolveRenderUserId({ id: "keith", email: "keith@example.com" }),
    ).rejects.toMatchObject({ code: "RENDER_USER_ID_UNRESOLVED" });
  });
});
