import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { isSupabaseEmailAuthConfigured, signInWithGoogle } from "@/lib/supabaseAuth";

const VOICE_ERROR_COPY = "Something went sideways. We have a protocol for this. Attempting recovery — please stand by.";
const VOICE_LOADING_COPY = "The Tribunal is reviewing this. Standard processing time: one moment.";

export default function SignIn() {
  const { isAuthenticated, isLoading, signIn, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const emailPasswordReady = isSupabaseEmailAuthConfigured();
  const googleReady = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()) && emailPasswordReady;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.replace("/welcome");
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error")?.trim();
    if (error === "callback_failed") {
      setErrorMessage(VOICE_ERROR_COPY);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const result = password
      ? await signIn(email, password)
      : await signInWithMagicLink(email);
    if (result.error) {
      console.error("Sign-in failed:", result.error);
      setErrorMessage(password && emailPasswordReady ? "Invalid login credentials" : result.error || VOICE_ERROR_COPY);
    } else if (password && emailPasswordReady) {
      window.location.replace("/welcome");
    } else {
      setSent(true);
    }

    setIsSubmitting(false);
  }

  async function handleGoogleSignIn() {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await signInWithGoogle("/welcome");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Google sign-in failed.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0F14] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at top, rgba(0,212,255,0.18), transparent 42%), radial-gradient(circle at bottom, rgba(0,107,127,0.22), transparent 48%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md overflow-hidden rounded-[32px] border border-[#00D4FF]/20 bg-[#050A0E]/90 shadow-[0_0_80px_rgba(0,212,255,0.12)] backdrop-blur-xl p-10"
        >
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-2xl font-bold text-white">Check your email</p>
              <p className="text-sm text-[#A7BBC7]">
                A one-time sign-in link was sent to{" "}
                <span className="font-semibold text-[#9BEFFF]">{email}</span>.
                Open it on this device to enter the app.
              </p>
              <p className="text-xs text-[#6F8794]">
                If the email does not arrive, check spam or verify the allowlist on the
                server.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7BDFFF]">
                  GestaltView
                </p>
                <h1 className="text-3xl font-black text-white">Return to your Manifest</h1>
                <p className="text-sm text-[#A7BBC7]">
                  Sign in with email and password, or leave the password empty to receive a private one-time link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoFocus
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#00D4FF]/40"
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={emailPasswordReady ? "Password or leave blank for email link" : "Email link mode"}
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 pr-24 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#00D4FF]/40"
                  />
                  {password ? (
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  ) : null}
                </div>

                {errorMessage ? (
                  <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {errorMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  aria-busy={isSubmitting}
                  className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] border border-[#00D4FF]/30 bg-[#00D4FF]/18 px-5 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#D9FBFF] shadow-[0_0_32px_rgba(0,212,255,0.16)] transition hover:bg-[#00D4FF]/24 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Signing in..." : password ? "Sign in" : "Send sign-in link"}
                </button>
                {googleReady ? (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center rounded-[1.5rem] border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Continue with Google
                  </button>
                ) : null}
                {isSubmitting ? (
                  <p className="text-center text-xs text-[#6F8794]">
                    {VOICE_LOADING_COPY}
                  </p>
                ) : null}
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
