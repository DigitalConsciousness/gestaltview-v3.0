import type { SpotifyPlaylistTrack } from "@/lib/spotify";

export interface MusicalDnaSpotifySong {
  id: string;
  title: string;
  artist: string;
  archetype: string;
  emotionalCluster: string;
  audioSrc: string;
  albumArt: string;
  bpm: number;
  key: string;
  dnaVector: number[];
  provenance: string[];
}

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function vectorFromString(input: string) {
  const hash = hashString(input);
  return Array.from({ length: 4 }, (_, index) =>
    Number((((hash >> (index * 8)) & 0xff) / 255).toFixed(3))
  );
}

export function createSpotifyFallbackAlbumArtDataUri(title: string, artist: string) {
  const seed = hashString(`${title}|${artist}|spotify`);
  const hue = seed % 360;
  const accent = (hue + 58) % 360;
  const initial = (title.trim().charAt(0) || "S").toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${hue} 72% 26%)" />
          <stop offset="100%" stop-color="hsl(${accent} 76% 14%)" />
        </linearGradient>
        <radialGradient id="glow" cx="52%" cy="24%" r="72%">
          <stop offset="0%" stop-color="rgba(29,185,84,0.44)" />
          <stop offset="100%" stop-color="rgba(29,185,84,0)" />
        </radialGradient>
      </defs>
      <rect width="480" height="480" rx="42" fill="url(#bg)" />
      <rect width="480" height="480" rx="42" fill="url(#glow)" />
      <circle cx="120" cy="120" r="82" fill="rgba(255,255,255,0.08)" />
      <circle cx="368" cy="352" r="118" fill="rgba(255,255,255,0.08)" />
      <text x="50%" y="55%" fill="white" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="164" font-weight="700">${initial}</text>
      <text x="50%" y="78%" fill="rgba(255,255,255,0.78)" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="28">${artist}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function spotifyTrackToMusicalDnaSong(
  track: SpotifyPlaylistTrack,
  playlistName?: string
): MusicalDnaSpotifySong {
  const title = track.name.trim() || "Untitled Track";
  const artist = track.artist.trim() || "Unknown Artist";
  const context = playlistName?.trim() || track.album || "Spotify playlist";
  const stableSeed = track.uri || track.id || `${title}|${artist}|${context}`;

  return {
    id: `spotify-track-${track.id}`,
    title,
    artist,
    archetype: "Spotify playlist track",
    emotionalCluster: `From ${context}`,
    audioSrc: track.previewUrl || "",
    albumArt: track.albumArt || createSpotifyFallbackAlbumArtDataUri(title, artist),
    bpm: 0,
    key: "Unknown",
    dnaVector: vectorFromString(stableSeed),
    provenance: [`Imported from Spotify ${context}`],
  };
}
