import { consumeStoredAuthRedirect, isSafeInternalRedirect, persistAuthRedirect } from "./authRedirect";

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim() || "";
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI?.trim() || "";
const PUBLIC_APP_URL =
  import.meta.env.VITE_GESTALTVIEW_PUBLIC_BASE_URL?.trim() ||
  import.meta.env.VITE_PUBLIC_APP_URL?.trim() ||
  import.meta.env.VITE_APP_URL?.trim() ||
  "";
const DEFAULT_REDIRECT_TO = "/musical-dna";
const CALLBACK_PATH = "/spotify/callback";
const AUTH_STORAGE_KEY = "gv_spotify_auth";
const TXN_STORAGE_KEY = "gv_spotify_oauth_txn";

const SPOTIFY_SCOPES = [
  "user-read-private",
  "playlist-read-private",
  "playlist-read-collaborative",
];

export interface SpotifyAuthToken {
  accessToken: string;
  tokenType: string;
  scope: string | null;
  expiresAt: number | null;
  refreshToken: string | null;
}

export interface SpotifyPlaylistSummary {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  externalUrl: string | null;
  trackCount: number;
  ownerName: string | null;
  collaborative: boolean;
  isPublic: boolean | null;
}

export function mergeSpotifyPlaylistTrackCount(
  playlists: SpotifyPlaylistSummary[],
  playlistId: string,
  trackCount: number
): SpotifyPlaylistSummary[] {
  const nextTrackCount = Number.isFinite(trackCount) && trackCount >= 0 ? Math.floor(trackCount) : 0;

  return playlists.map((playlist) =>
    playlist.id === playlistId
      ? {
          ...playlist,
          trackCount: nextTrackCount,
        }
      : playlist
  );
}

export function chooseSpotifyDefaultPlaylistId(
  playlists: SpotifyPlaylistSummary[],
  preferredPlaylistId = ""
): string {
  const preferred = preferredPlaylistId.trim();
  if (preferred && playlists.some((playlist) => playlist.id === preferred)) {
    return preferred;
  }

  const sortedByTrackCount = [...playlists].sort((left, right) => right.trackCount - left.trackCount);
  return sortedByTrackCount[0]?.id ?? "";
}

export interface SpotifyPlaylistTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string | null;
  previewUrl: string | null;
  externalUrl: string | null;
  uri: string | null;
  durationMs: number | null;
}

interface SpotifyOAuthTransaction {
  state: string;
  codeVerifier: string;
  redirectTo: string;
  createdAt: number;
}

interface SpotifyTokenResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  scope?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface SpotifyPagedResponse<T> {
  items?: T[];
  next?: string | null;
}

interface SpotifyTrackPayload {
  id?: string | null;
  name?: string;
  artists?: Array<{ name?: string }>;
  album?: { name?: string; images?: Array<{ url?: string }> };
  preview_url?: string | null;
  external_urls?: { spotify?: string };
  uri?: string | null;
  duration_ms?: number;
  type?: string;
  is_local?: boolean;
}

interface SpotifyPlaylistItemPayload {
  item?: SpotifyTrackPayload | null;
  track?: SpotifyTrackPayload | null;
  is_local?: boolean;
}

interface SpotifyPlaylistPayload {
  id: string;
  name: string;
  description?: string;
  external_urls?: { spotify?: string };
  images?: Array<{ url?: string }>;
  items?: { total?: number };
  tracks?: { total?: number };
  owner?: { display_name?: string };
  collaborative?: boolean;
  public?: boolean | null;
}

function requireSpotifyClientId(): string {
  if (!SPOTIFY_CLIENT_ID) {
    throw new Error("Spotify client ID is not configured.");
  }

  return SPOTIFY_CLIENT_ID;
}

export function getSpotifyRedirectUri(origin = window.location.origin): string {
  if (SPOTIFY_REDIRECT_URI) {
    return SPOTIFY_REDIRECT_URI;
  }

  if (PUBLIC_APP_URL) {
    return `${PUBLIC_APP_URL.replace(/\/+$/, "")}${CALLBACK_PATH}`;
  }

  return `${origin}${CALLBACK_PATH}`;
}

export function getSpotifyConfigurationStatus(origin = window.location.origin): {
  configured: boolean;
  message: string | null;
  redirectUri: string;
} {
  const redirectUri = getSpotifyRedirectUri(origin);

  if (!SPOTIFY_CLIENT_ID) {
    return {
      configured: false,
      message: "Spotify client ID is not configured in this build.",
      redirectUri,
    };
  }

  try {
    const redirectOrigin = new URL(redirectUri).origin;
    if (!SPOTIFY_REDIRECT_URI && !PUBLIC_APP_URL) {
      return {
        configured: true,
        message: "Spotify will use the current page origin for OAuth. Make sure this callback is registered in Spotify.",
        redirectUri,
      };
    }

    if (redirectOrigin !== origin) {
      return {
        configured: true,
        message: `Spotify redirect URI points to ${redirectOrigin}; continue from that registered deployment or add this preview callback in Spotify if authorization fails.`,
        redirectUri,
      };
    }
  } catch {
    return {
      configured: false,
      message: "Spotify redirect URI is not a valid URL.",
      redirectUri,
    };
  }

  return { configured: true, message: null, redirectUri };
}

function getAuthorizerUrl(): string {
  return "https://accounts.spotify.com/authorize";
}

function getTokenUrl(): string {
  return "https://accounts.spotify.com/api/token";
}

function randomBytes(length = 32): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256Base64Url(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return base64UrlEncode(new Uint8Array(digest));
}

function createRandomToken(length = 32): string {
  return base64UrlEncode(randomBytes(length));
}

function readTransaction(storage: Storage | null | undefined): SpotifyOAuthTransaction | null {
  try {
    const raw = storage?.getItem(TXN_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SpotifyOAuthTransaction;
    if (
      typeof parsed.state !== "string" ||
      typeof parsed.codeVerifier !== "string" ||
      typeof parsed.redirectTo !== "string" ||
      typeof parsed.createdAt !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeTransaction(storage: Storage | null | undefined, value: SpotifyOAuthTransaction): void {
  try {
    storage?.setItem(TXN_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
}

function clearTransaction(storage: Storage | null | undefined): void {
  try {
    storage?.removeItem(TXN_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function isSpotifyConfigured(): boolean {
  return getSpotifyConfigurationStatus().configured;
}

export function hasSpotifyAuth(): boolean {
  try {
    return Boolean(localStorage.getItem(AUTH_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function readSpotifyAuthToken(): SpotifyAuthToken | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SpotifyAuthToken;
    if (
      typeof parsed.accessToken !== "string" ||
      typeof parsed.tokenType !== "string"
    ) {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      tokenType: parsed.tokenType,
      scope: typeof parsed.scope === "string" ? parsed.scope : null,
      expiresAt: typeof parsed.expiresAt === "number" ? parsed.expiresAt : null,
      refreshToken: typeof parsed.refreshToken === "string" ? parsed.refreshToken : null,
    };
  } catch {
    return null;
  }
}

function writeSpotifyAuthToken(token: SpotifyAuthToken): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(token));
  } catch {
    // Ignore storage failures.
  }
}

export function clearSpotifyAuth(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }

  clearTransaction(sessionStorage);
}

async function buildAuthorizeUrl(codeChallenge: string, state: string): Promise<string> {
  const authorizeUrl = new URL(getAuthorizerUrl());
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", requireSpotifyClientId());
  authorizeUrl.searchParams.set("scope", SPOTIFY_SCOPES.join(" "));
  authorizeUrl.searchParams.set("redirect_uri", getSpotifyRedirectUri());
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("show_dialog", "true");
  return authorizeUrl.toString();
}

export async function beginSpotifyAuthFlow(redirectTo = DEFAULT_REDIRECT_TO): Promise<void> {
  if (!isSafeInternalRedirect(redirectTo)) {
    throw new Error("Spotify redirect target must be an internal path.");
  }

  const codeVerifier = createRandomToken(48);
  const state = createRandomToken(24);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  writeTransaction(sessionStorage, {
    state,
    codeVerifier,
    redirectTo,
    createdAt: Date.now(),
  });
  persistAuthRedirect(sessionStorage, redirectTo);
  window.location.assign(await buildAuthorizeUrl(codeChallenge, state));
}

async function exchangeSpotifyCode(code: string, codeVerifier: string): Promise<SpotifyAuthToken> {
  const response = await fetch(getTokenUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getSpotifyRedirectUri(),
      client_id: requireSpotifyClientId(),
      code_verifier: codeVerifier,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as SpotifyTokenResponse;
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || "Spotify token exchange failed.");
  }

  const expiresIn = typeof payload.expires_in === "number" ? payload.expires_in : 0;
  return {
    accessToken: payload.access_token?.trim() || "",
    tokenType: payload.token_type?.trim() || "Bearer",
    scope: payload.scope?.trim() || null,
    expiresAt: expiresIn > 0 ? Date.now() + expiresIn * 1000 - 60_000 : null,
    refreshToken: payload.refresh_token?.trim() || null,
  };
}

async function refreshSpotifyToken(refreshToken: string): Promise<SpotifyAuthToken> {
  const response = await fetch(getTokenUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: requireSpotifyClientId(),
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as SpotifyTokenResponse;
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || "Spotify token refresh failed.");
  }

  const existing = readSpotifyAuthToken();
  const expiresIn = typeof payload.expires_in === "number" ? payload.expires_in : 0;
  return {
    accessToken: payload.access_token?.trim() || "",
    tokenType: payload.token_type?.trim() || "Bearer",
    scope: payload.scope?.trim() || existing?.scope || null,
    expiresAt: expiresIn > 0 ? Date.now() + expiresIn * 1000 - 60_000 : null,
    refreshToken: payload.refresh_token?.trim() || refreshToken || existing?.refreshToken || null,
  };
}

async function getValidSpotifyAuthToken(): Promise<SpotifyAuthToken> {
  const token = readSpotifyAuthToken();
  if (!token) {
    throw new Error("Spotify is not connected yet.");
  }

  if (token.expiresAt && token.expiresAt > Date.now()) {
    return token;
  }

  if (!token.refreshToken) {
    throw new Error("Spotify session expired and cannot be refreshed.");
  }

  const refreshed = await refreshSpotifyToken(token.refreshToken);
  writeSpotifyAuthToken(refreshed);
  return refreshed;
}

async function spotifyFetchJson<T>(url: string, token: SpotifyAuthToken): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `${token.tokenType} ${token.accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Spotify request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

async function fetchAllPages<T>(initialUrl: string, token: SpotifyAuthToken): Promise<T[]> {
  const items: T[] = [];
  let next: string | null = initialUrl;

  while (next) {
    const page: SpotifyPagedResponse<T> = await spotifyFetchJson(next, token);
    if (Array.isArray(page.items)) {
      items.push(...page.items);
    }
    next = page.next ?? null;
  }

  return items;
}

export async function completeSpotifyAuthFlow(search: string): Promise<string> {
  const params = new URLSearchParams(search);
  const error = params.get("error");
  if (error) {
    throw new Error(params.get("error_description") || error);
  }

  const code = params.get("code")?.trim() || "";
  const state = params.get("state")?.trim() || "";
  if (!code) {
    throw new Error("Missing Spotify authorization code.");
  }

  const txn = readTransaction(sessionStorage);
  if (!txn) {
    throw new Error("No pending Spotify authorization transaction was found.");
  }

  if (txn.state !== state) {
    throw new Error("Spotify callback state did not match the original request.");
  }

  const token = await exchangeSpotifyCode(code, txn.codeVerifier);
  writeSpotifyAuthToken(token);
  clearTransaction(sessionStorage);
  return consumeStoredAuthRedirect(sessionStorage, txn.redirectTo || DEFAULT_REDIRECT_TO);
}

export async function fetchSpotifyPlaylists(): Promise<SpotifyPlaylistSummary[]> {
  const token = await getValidSpotifyAuthToken();
  const playlists = await fetchAllPages<SpotifyPlaylistPayload>(
    "https://api.spotify.com/v1/me/playlists?limit=50",
    token
  );

  return playlists.map((playlist) => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description || "",
    imageUrl: playlist.images?.[0]?.url || null,
    externalUrl: playlist.external_urls?.spotify || null,
    trackCount: playlist.items?.total ?? playlist.tracks?.total ?? 0,
    ownerName: playlist.owner?.display_name || null,
    collaborative: Boolean(playlist.collaborative),
    isPublic: typeof playlist.public === "boolean" ? playlist.public : null,
  }));
}

export async function fetchSpotifyPlaylistTracks(playlistId: string): Promise<SpotifyPlaylistTrack[]> {
  const token = await getValidSpotifyAuthToken();
  const encodedId = encodeURIComponent(playlistId);
  const items = await fetchAllPages<SpotifyPlaylistItemPayload>(
    `https://api.spotify.com/v1/playlists/${encodedId}/items?limit=50`,
    token
  );

  return items
    .map((entry) => {
      const track = entry.item ?? entry.track;
      return {
        track,
        isLocal: Boolean(entry.is_local || track?.is_local),
      };
    })
    .filter(
      (entry): entry is { track: SpotifyTrackPayload; isLocal: boolean } =>
        Boolean(entry.track && (entry.track.type === "track" || entry.isLocal) && entry.track.name),
    )
    .map(({ track }, index) => {
      const uri = track.uri?.trim() || null;
      const id = track.id?.trim() || uri || `spotify-local-track-${encodedId}-${index}`;

      return {
        id,
        name: track.name || "Untitled Track",
        artist: track.artists?.map((artist) => artist.name || "").filter(Boolean).join(", ") || "Unknown Artist",
        album: track.album?.name || "",
        albumArt: track.album?.images?.[0]?.url || null,
        previewUrl: track.preview_url || null,
        externalUrl: track.external_urls?.spotify || null,
        uri,
        durationMs: typeof track.duration_ms === "number" ? track.duration_ms : null,
      };
    });
}
