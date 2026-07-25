import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseEmailAuthConfigured, signInWithGoogle } from "@/lib/supabaseAuth";

export default function Signup() {
  const { isAuthenticated, isLoading, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const result = await signUp(email, password);
    if (result.error) {
      setErrorMessage(result.error);
    } else if (emailPasswordReady && !result.needsConfirmation) {
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
            "radial-gradient(circle at top left, rgba(0,212,255,0.18), transparent 38%), radial-gradient(circle at bottom right, rgba(153,69,255,0.20), transparent 44%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md overflow-hidden rounded-[32px] border border-[#00D4FF]/20 bg-[#050A0E]/90 p-10 shadow-[0_0_80px_rgba(0,212,255,0.12)] backdrop-blur-xl"
        >
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-2xl font-bold text-white">Check your email</p>
              <p className="text-sm leading-relaxed text-[#A7BBC7]">
                GestaltView accepted the request for{" "}
                <span className="font-semibold text-[#9BEFFF]">{email}</span>. If email confirmation is enabled,
                open the link on this device to finish.
              </p>
              <Link href="/login">
                <a className="inline-flex rounded-full border border-[#00D4FF]/25 bg-[#00D4FF]/12 px-4 py-2 text-sm font-semibold text-[#D9FBFF]">
                  Return to sign in
                </a>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7BDFFF]">
                  GestaltView
                </p>
                <h1 className="text-3xl font-black text-white">Create your account</h1>
                <p className="text-sm leading-relaxed text-[#A7BBC7]">
                  Use email and password when Supabase email auth is configured. Otherwise this falls back to the
                  private one-time link flow.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  required
                  autoFocus
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#00D4FF]/40"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={emailPasswordReady ? "Create a password" : "Optional in private-link mode"}
                  minLength={emailPasswordReady ? 8 : undefined}
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#00D4FF]/40"
                />

                {errorMessage ? (
                  <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {errorMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting || !email || (emailPasswordReady && password.length < 8)}
                  aria-busy={isSubmitting}
                  className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] border border-[#00D4FF]/30 bg-[#00D4FF]/18 px-5 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#D9FBFF] shadow-[0_0_32px_rgba(0,212,255,0.16)] transition hover:bg-[#00D4FF]/24 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating..." : "Create account"}
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
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
