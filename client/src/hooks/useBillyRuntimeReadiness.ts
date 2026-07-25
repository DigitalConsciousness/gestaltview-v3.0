import { useEffect, useState } from "react";
import { BILLY_RUNTIME_READINESS_KEY, verifyBillyRuntimeGuide } from "@/lib/billy-runtime-guide";

export function useBillyRuntimeReadiness(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const cached = window.localStorage.getItem(BILLY_RUNTIME_READINESS_KEY) === "1";
    if (cached) {
      setReady(true);
      return;
    }

    const verified = verifyBillyRuntimeGuide();
    if (verified) {
      window.localStorage.setItem(BILLY_RUNTIME_READINESS_KEY, "1");
      setReady(true);
      return;
    }

    setReady(false);
  }, []);

  return ready;
}
