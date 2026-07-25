import { useEffect, useState } from "react";
import { completeSpotifyAuthFlow } from "@/lib/spotify";

export default function SpotifyCallbackPage() {
  const [message, setMessage] = useState("Finishing Spotify connection...");

  useEffect(() => {
    let cancelled = false;

    async function complete() {
      try {
        const redirectTo = await completeSpotifyAuthFlow(window.location.search);
        if (!cancelled) {
          window.location.replace(redirectTo);
        }
      } catch (error) {
        const text = error instanceof Error ? error.message : "Spotify connection failed.";
        if (!cancelled) {
          setMessage(text);
        }
      }
    }

    void complete();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070B] px-4 text-white">
      <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#1DB954]">Spotify</p>
        <h1 className="mt-3 text-2xl font-semibold">Connection status</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/64">{message}</p>
        {message !== "Finishing Spotify connection..." ? (
          <a
            href="/musical-dna"
            className="mt-5 inline-flex rounded-full border border-[#1DB954]/25 bg-[#1DB954]/12 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Musical DNA
          </a>
        ) : null}
      </div>
    </main>
  );
}
