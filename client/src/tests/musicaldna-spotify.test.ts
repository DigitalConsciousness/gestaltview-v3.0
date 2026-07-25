import { describe, expect, it, vi } from "vitest";

async function importSpotifyWithEnv(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value);
  }
  return import("@/lib/spotify");
}

describe("Musical DNA Spotify configuration", () => {
  it("uses VITE_SPOTIFY_REDIRECT_URI as the callback URI", async () => {
    const spotify = await importSpotifyWithEnv({
      VITE_SPOTIFY_CLIENT_ID: "spotify-client",
      VITE_SPOTIFY_REDIRECT_URI: "https://gestaltview-di-gsvw.vercel.app/spotify/callback",
    });

    expect(spotify.getSpotifyRedirectUri("https://gestaltview-di-gsvw.vercel.app")).toBe(
      "https://gestaltview-di-gsvw.vercel.app/spotify/callback"
    );
    expect(spotify.getSpotifyConfigurationStatus("https://gestaltview-di-gsvw.vercel.app")).toMatchObject({
      configured: true,
      message: null,
    });
  });

  it("keeps the Spotify connect button available and warns when the registered callback points elsewhere", async () => {
    const spotify = await importSpotifyWithEnv({
      VITE_SPOTIFY_CLIENT_ID: "spotify-client",
      VITE_SPOTIFY_REDIRECT_URI: "https://gestaltview-di-gsvw.vercel.app/spotify/callback",
    });

    const status = spotify.getSpotifyConfigurationStatus("https://preview-branch.vercel.app");

    expect(status.configured).toBe(true);
    expect(status.redirectUri).toBe(
      "https://gestaltview-di-gsvw.vercel.app/spotify/callback",
    );
    expect(status.message).toContain("gestaltview-di-gsvw.vercel.app");
  });

  it("falls back to the current origin callback when no deployment callback is configured", async () => {
    const spotify = await importSpotifyWithEnv({
      VITE_SPOTIFY_CLIENT_ID: "spotify-client",
      VITE_SPOTIFY_REDIRECT_URI: "",
      VITE_GESTALTVIEW_PUBLIC_BASE_URL: "",
      VITE_PUBLIC_APP_URL: "",
      VITE_APP_URL: "",
    });

    const status = spotify.getSpotifyConfigurationStatus("https://preview-branch.vercel.app");

    expect(status.configured).toBe(true);
    expect(status.redirectUri).toBe("https://preview-branch.vercel.app/spotify/callback");
    expect(status.message).toContain("current page origin");
  });

  it("prefers the playlist with the most tracks when no prior selection exists", async () => {
    const spotify = await importSpotifyWithEnv({
      VITE_SPOTIFY_CLIENT_ID: "spotify-client",
      VITE_SPOTIFY_REDIRECT_URI: "https://gestaltview-di-gsvw.vercel.app/spotify/callback",
    });

    expect(
      spotify.chooseSpotifyDefaultPlaylistId(
        [
          { id: "empty", name: "Empty", description: "", imageUrl: null, externalUrl: null, trackCount: 0, ownerName: null, collaborative: false, isPublic: null },
          { id: "full", name: "Full", description: "", imageUrl: null, externalUrl: null, trackCount: 155, ownerName: null, collaborative: false, isPublic: null },
        ]
      )
    ).toBe("full");
  });

  it("syncs a playlist track count back into the summary list", async () => {
    const spotify = await importSpotifyWithEnv({
      VITE_SPOTIFY_CLIENT_ID: "spotify-client",
      VITE_SPOTIFY_REDIRECT_URI: "https://gestaltview-di-gsvw.vercel.app/spotify/callback",
    });

    expect(
      spotify.mergeSpotifyPlaylistTrackCount(
        [
          { id: "empty", name: "Empty", description: "", imageUrl: null, externalUrl: null, trackCount: 0, ownerName: null, collaborative: false, isPublic: null },
          { id: "full", name: "Full", description: "", imageUrl: null, externalUrl: null, trackCount: 0, ownerName: null, collaborative: false, isPublic: null },
        ],
        "full",
        155
      )[1]?.trackCount
    ).toBe(155);
  });

  it("reads playlist totals from Spotify's current items summary field", async () => {
    const spotify = await importSpotifyWithEnv({
      VITE_SPOTIFY_CLIENT_ID: "spotify-client",
      VITE_SPOTIFY_REDIRECT_URI: "https://gestaltview-di-gsvw.vercel.app/spotify/callback",
    });
    const store = new Map<string, string>([
      [
        "gv_spotify_auth",
        JSON.stringify({
          accessToken: "access-token",
          tokenType: "Bearer",
          scope: "playlist-read-private",
          expiresAt: Date.now() + 60_000,
          refreshToken: "refresh-token",
        }),
      ],
    ]);
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => store.set(key, value)),
      removeItem: vi.fn((key: string) => store.delete(key)),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            items: [
              {
                id: "playlist-id",
                name: "My Playlist",
                items: { total: 155 },
              },
            ],
            next: null,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(spotify.fetchSpotifyPlaylists()).resolves.toMatchObject([
      { id: "playlist-id", name: "My Playlist", trackCount: 155 },
    ]);
  });

  it("loads tracks from Spotify's current item response field", async () => {
    const spotify = await importSpotifyWithEnv({
      VITE_SPOTIFY_CLIENT_ID: "spotify-client",
      VITE_SPOTIFY_REDIRECT_URI: "https://gestaltview-di-gsvw.vercel.app/spotify/callback",
    });
    const store = new Map<string, string>([
      [
        "gv_spotify_auth",
        JSON.stringify({
          accessToken: "access-token",
          tokenType: "Bearer",
          scope: "playlist-read-private",
          expiresAt: Date.now() + 60_000,
          refreshToken: "refresh-token",
        }),
      ],
    ]);
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => store.set(key, value)),
      removeItem: vi.fn((key: string) => store.delete(key)),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            items: [
              {
                item: {
                  id: "track-id",
                  name: "Current Signal",
                  artists: [{ name: "Field Recording" }],
                  album: { name: "Current API", images: [] },
                  uri: "spotify:track:track-id",
                  type: "track",
                  duration_ms: 120000,
                },
              },
            ],
            next: null,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(spotify.fetchSpotifyPlaylistTracks("playlist-id")).resolves.toMatchObject([
      {
        id: "track-id",
        name: "Current Signal",
        artist: "Field Recording",
      },
    ]);
  });

  it("keeps local Spotify playlist files importable when Spotify omits track IDs", async () => {
    const spotify = await importSpotifyWithEnv({
      VITE_SPOTIFY_CLIENT_ID: "spotify-client",
      VITE_SPOTIFY_REDIRECT_URI: "https://gestaltview-di-gsvw.vercel.app/spotify/callback",
    });
    const store = new Map<string, string>([
      [
        "gv_spotify_auth",
        JSON.stringify({
          accessToken: "access-token",
          tokenType: "Bearer",
          scope: "playlist-read-private playlist-read-collaborative",
          expiresAt: Date.now() + 60_000,
          refreshToken: "refresh-token",
        }),
      ],
    ]);
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => store.set(key, value)),
      removeItem: vi.fn((key: string) => store.delete(key)),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            items: [
              {
                track: {
                  id: null,
                  name: "Local Signal",
                  artists: [{ name: "Field Recording" }],
                  album: { name: "Phone Uploads", images: [] },
                  uri: "spotify:local:Field+Recording:Local+Signal:120",
                  type: "track",
                  is_local: true,
                  duration_ms: 120000,
                },
              },
            ],
            next: null,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(spotify.fetchSpotifyPlaylistTracks("playlist-id")).resolves.toMatchObject([
      {
        id: "spotify:local:Field+Recording:Local+Signal:120",
        name: "Local Signal",
        artist: "Field Recording",
      },
    ]);
  });

});
