import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { appFetchJson } from "@/lib/appFetch";
import {
  isSupabaseEmailAuthConfigured,
  requestInviteOnlyMagicLink,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  syncBrowserSessionToAppCookie,
} from "@/lib/supabaseAuth";

export type UserTier = "anonymous" | "free" | "core" | "pro" | "enterprise";
export type AuthStartupState = "healthy" | "auth_unavailable_but_fail_open";

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "user";
}

export interface AuthSession {
  access_token: string;
  user: AuthUser;
  expiresAt?: number | null;
}

export interface AuthProfile {
  id: string;
  email: string;
  tier: UserTier;
  isAdmin: boolean;
  billyQueryCount: number;
  subscriptionStatus: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: AuthProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  tier: UserTier;
  startupState: AuthStartupState;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getAuthHeader: () => Record<string, string>;
}

type AuthSessionPayload =
  | {
      authenticated: true;
      user: AuthUser;
      tier?: UserTier;
      isAdmin?: boolean;
    }
  | {
      authenticated: false;
    };

type PublicSessionState = {
  tier: UserTier;
  queryCount: number;
  queryLimit: number;
  remaining: number;
  isLimited: boolean;
};

const DEFAULT_PUBLIC_SESSION: PublicSessionState = {
  tier: "anonymous",
  queryCount: 0,
  queryLimit: 2,
  remaining: 2,
  isLimited: false,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function buildProfile(
  authUser: AuthUser | null,
  publicSession: PublicSessionState,
  authenticatedTier: UserTier | null = null
): AuthProfile | null {
  if (!authUser) {
    return {
      id: "guest",
      email: "",
      tier: publicSession.tier,
      isAdmin: false,
      billyQueryCount: publicSession.queryCount,
      subscriptionStatus: "inactive",
    };
  }

  return {
    id: authUser.id,
    email: authUser.email,
    tier: authenticatedTier ?? "free",
    isAdmin: authUser.role === "admin",
    billyQueryCount: publicSession.queryCount,
    subscriptionStatus: "active",
  };
}

async function readPublicSessionState(): Promise<PublicSessionState> {
  const result = await appFetchJson<PublicSessionState>("/api/session/state", {
    timeoutMs: 5_000,
    retries: 0,
  });

  if (result.ok) {
    return result.data;
  }

  console.warn("[auth] /api/session/state unavailable; continuing unauthenticated.", {
    code: result.code,
    status: result.status,
    message: result.message,
  });
  return DEFAULT_PUBLIC_SESSION;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startupState] = useState<AuthStartupState>("healthy");
  const [publicSession, setPublicSession] = useState<PublicSessionState>(DEFAULT_PUBLIC_SESSION);

  const refreshProfile = useCallback(async () => {
      const nextPublicSession = await readPublicSessionState();
      setPublicSession(nextPublicSession);
      setProfile(buildProfile(user, nextPublicSession));
    }, [user]);

  const refreshAuthSession = useCallback(async () => {
    const result = await appFetchJson<AuthSessionPayload>("/api/auth/session", {
      timeoutMs: 5_000,
      retries: 0,
    });

    if (result.ok && result.data.authenticated) {
      const nextUser = result.data.user;
      const nextTier = result.data.tier ?? "free";
      setUser(nextUser);
      setSession({
        access_token: "authenticated",
        user: nextUser,
        expiresAt: null,
      });
      setProfile(buildProfile(nextUser, publicSession, nextTier));
      return true;
    }

    setUser(null);
    setSession(null);
    setProfile(buildProfile(null, publicSession));
    return false;
  }, [publicSession]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const nextPublicSession = await readPublicSessionState();
      const authResult = await appFetchJson<AuthSessionPayload>("/api/auth/session", {
        timeoutMs: 5_000,
        retries: 0,
      });

      if (!mounted) {
        return;
      }

      setPublicSession(nextPublicSession);

      if (authResult.ok && authResult.data.authenticated) {
        const nextUser = authResult.data.user;
        const nextTier = authResult.data.tier ?? "free";
        setUser(nextUser);
        setSession({
          access_token: "authenticated",
          user: nextUser,
          expiresAt: null,
        });
        setProfile(buildProfile(nextUser, nextPublicSession, nextTier));
      } else {
        setUser(null);
        setSession(null);
        setProfile(buildProfile(null, nextPublicSession));
      }

      setIsLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (_email: string, password?: string) => {
    try {
      if (password && isSupabaseEmailAuthConfigured()) {
        const browserSession = await signInWithEmailPassword(_email.trim(), password);
        if (browserSession?.access_token) {
          await syncBrowserSessionToAppCookie("/welcome");
          await refreshAuthSession();
          return { error: null };
        }
      }

      await requestInviteOnlyMagicLink(_email.trim(), "/welcome");
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Sign-in request failed." };
    }
  }, [refreshAuthSession]);

  const signUp = useCallback(async (_email: string, _password: string) => {
    try {
      if (_password && isSupabaseEmailAuthConfigured()) {
        const browserSession = await signUpWithEmailPassword(_email.trim(), _password, "/welcome");
        if (browserSession?.access_token) {
          await syncBrowserSessionToAppCookie("/welcome");
          await refreshAuthSession();
          return { error: null, needsConfirmation: false };
        }
        return { error: null, needsConfirmation: true };
      }

      await requestInviteOnlyMagicLink(_email.trim(), "/welcome");
      return { error: null, needsConfirmation: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Sign-up request failed." };
    }
  }, [refreshAuthSession]);

  const signInWithMagicLink = useCallback(async (_email: string) => {
    try {
      await requestInviteOnlyMagicLink(_email.trim(), "/welcome");
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Magic-link request failed." };
    }
  }, []);

  const signOut = useCallback(async () => {
    await appFetchJson<{ ok: boolean }>("/api/logout", {
      method: "POST",
      timeoutMs: 5_000,
      retryUnsafe: true,
    });

    setUser(null);
    setSession(null);
    const nextPublicSession = await readPublicSessionState();
    setPublicSession(nextPublicSession);
    setProfile(buildProfile(null, nextPublicSession));
  }, []);

  const getAuthHeader = useCallback((): Record<string, string> => {
    return {};
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: Boolean(user),
    isConfigured: true,
    isAdmin: profile?.isAdmin ?? false,
    tier: profile?.tier ?? "anonymous",
    startupState,
    signIn,
    signUp,
    signInWithMagicLink,
    signOut,
    refreshProfile,
    getAuthHeader,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return context;
}

export const authConfigError = null;
