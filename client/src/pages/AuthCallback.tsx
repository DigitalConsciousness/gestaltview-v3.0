import { useEffect } from "react";
import {
  establishBrowserSessionFromCallbackUrl,
  getSupabaseBrowserClient,
  syncBrowserSessionToAppCookie,
} from "../lib/supabaseAuth";

const AUTH_CALLBACK_TIMEOUT_MS = 8_000;

export default function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect")?.trim();
    const target = redirect && redirect.startsWith("/") ? redirect : "/welcome";
    let cancelled = false;
    let unsubscribe = () => {};
    let timeoutId: number | null = null;

    const fail = () => {
      if (!cancelled) {
        window.location.replace("/login?error=callback_failed");
      }
    };

    const redirectAfterSync = async () => {
      await establishBrowserSessionFromCallbackUrl();
      await syncBrowserSessionToAppCookie(target);
      if (!cancelled) {
        window.location.replace(target);
      }
    };

    const finalize = async () => {
      try {
        await redirectAfterSync();
        return;
      } catch {
        try {
          const client = getSupabaseBrowserClient();
          const { data } = client.auth.onAuthStateChange(async (_event, session) => {
            if (cancelled || !session?.access_token) {
              return;
            }

            try {
              if (timeoutId) {
                window.clearTimeout(timeoutId);
                timeoutId = null;
              }
              await redirectAfterSync();
            } catch {
              fail();
            }
          });

          unsubscribe = () => data.subscription.unsubscribe();
          timeoutId = window.setTimeout(fail, AUTH_CALLBACK_TIMEOUT_MS);
        } catch {
          fail();
        }
      }
    };

    void finalize();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      unsubscribe();
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "#0A0F14",
        color: "#9BEFFF",
        fontSize: "1rem",
        letterSpacing: "0.1em",
      }}
    >
      Logging you in…
    </div>
  );
}
