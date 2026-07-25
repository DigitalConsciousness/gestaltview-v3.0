import { describe, expect, it } from "vitest";
import { spotifyTrackToMusicalDnaSong } from "@/lib/spotifyMusicalDna";
import type { SpotifyPlaylistTrack } from "@/lib/spotify";

const baseTrack: SpotifyPlaylistTrack = {
  id: "4uLU6hMCjMI75M1A2tKUQC",
  name: "Nevermind",
  artist: "Leonard Cohen",
  album: "Popular Problems",
  albumArt: "https://i.scdn.co/image/example",
  previewUrl: "https://p.scdn.co/mp3-preview/example",
  externalUrl: "https://open.spotify.com/track/example",
  uri: "spotify:track:4uLU6hMCjMI75M1A2tKUQC",
  durationMs: 279000,
};

describe("spotifyTrackToMusicalDnaSong", () => {
  it("maps Spotify playlist tracks into Musical DNA songs", () => {
    const song = spotifyTrackToMusicalDnaSong(baseTrack, "Signal Songs");

    expect(song).toMatchObject({
      id: "spotify-track-4uLU6hMCjMI75M1A2tKUQC",
      title: "Nevermind",
      artist: "Leonard Cohen",
      archetype: "Spotify playlist track",
      emotionalCluster: "From Signal Songs",
      audioSrc: "https://p.scdn.co/mp3-preview/example",
      albumArt: "https://i.scdn.co/image/example",
      bpm: 0,
      key: "Unknown",
    });
    expect(song.dnaVector).toHaveLength(4);
    expect(song.dnaVector.every((value) => value >= 0 && value <= 1)).toBe(true);
  });

  it("uses fallback artwork and omits playback when Spotify has no preview URL", () => {
    const song = spotifyTrackToMusicalDnaSong({
      ...baseTrack,
      albumArt: null,
      previewUrl: null,
    });

    expect(song.audioSrc).toBe("");
    expect(song.albumArt).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
    expect(song.emotionalCluster).toBe("From Popular Problems");
  });
});
