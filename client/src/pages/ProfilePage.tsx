import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  ChevronDown,
  Download,
  Mail,
  Save,
  ShieldCheck,
  Upload,
  UserRound,
  ExternalLink,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { GlassCard } from "@/components/ui/GlassCard";
import ProfileIngestPanel from "@/components/ProfileIngestPanel";
import ProfileDisplay from "@/components/ProfileDisplay";
import MassExodusButton from "@/components/MassExodusButton";
import RoomIdentityHeader from "@/components/RoomIdentityHeader";
import RoomStateBadge from "@/components/RoomStateBadge";
import { useAuth } from "@/contexts/AuthContext";
import { appFetchJson } from "@/lib/appFetch";
import { getRuntimeArtifactCounts } from "@/lib/artifact";
import { uploadUserFileToServer } from "@/lib/fileStorage";
import { appendUserFile, createUserFileRecord, type UserFileRecord } from "@/lib/innerWorldFiles";
import { usePortrait } from "@/hooks/usePortrait";
import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import { EMBODIMENT_PROFILES, type EmbodimentProfile } from "@shared/embodiment";
import { MODULES, type ModuleDefinition } from "@/components/home/modules";
import { buildProfileModuleLandscapeCopy } from "@/lib/launchCore";
import type { PersonalityProfile, PersonalityDimension } from "@shared/profileIngestion";

export type ProfilePreferences = {
  displayName: string;
  avatarUrl: string;
  embodimentProfileSlug: string;
};

type ProfilePreferencesResponse = {
  preferences: ProfilePreferences;
};

const PROFILE_PREFS_KEY = "gv:profile:preferences:v1";
const PROFILE_FRAMING_KEY = "gv:profile:framing:v1";
const FOUNDER_CONTACT_EMAIL = "keithsoyka@gmail.com";
const DEFAULT_PREFERENCES: ProfilePreferences = {
  displayName: "",
  avatarUrl: "",
  embodimentProfileSlug: "billy",
};
const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

const ASSIGNABLE_PROFILES = (Object.values(EMBODIMENT_PROFILES) as EmbodimentProfile[])
  .filter((profile) => profile.visibilityScope !== "founder-only")
  .sort((a, b) => a.publicName.localeCompare(b.publicName));

function readLocalPreferences(): ProfilePreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(PROFILE_PREFS_KEY) ?? "{}") as Partial<ProfilePreferences>;
    return {
      displayName: typeof parsed.displayName === "string" ? parsed.displayName : "",
      avatarUrl:
        typeof parsed.avatarUrl === "string" && !parsed.avatarUrl.startsWith("data:")
          ? parsed.avatarUrl
          : "",
      embodimentProfileSlug:
        typeof parsed.embodimentProfileSlug === "string" && parsed.embodimentProfileSlug
          ? parsed.embodimentProfileSlug
          : "billy",
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function readLocalContextFraming(): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return window.localStorage.getItem(PROFILE_FRAMING_KEY) ?? "";
  } catch {
    return "";
  }
}

export function normalizeProfilePreferencesForStorage(preferences: ProfilePreferences): ProfilePreferences {
  return {
    ...preferences,
    avatarUrl: preferences.avatarUrl.startsWith("data:") ? "" : preferences.avatarUrl,
  };
}

function writeLocalPreferences(preferences: ProfilePreferences) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      PROFILE_PREFS_KEY,
      JSON.stringify(normalizeProfilePreferencesForStorage(preferences)),
    );
  } catch (error) {
    console.warn("[ProfilePage] local preference write failed", error);
  }
}

function writeLocalContextFraming(value: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(PROFILE_FRAMING_KEY, value);
  } catch (error) {
    console.warn("[ProfilePage] local framing write failed", error);
  }
}

function getProfileBySlug(slug: string): EmbodimentProfile {
  return EMBODIMENT_PROFILES[slug as keyof typeof EMBODIMENT_PROFILES] ?? EMBODIMENT_PROFILES.billy;
}

function initialsFor(name: string, email: string): string {
  const source = name.trim() || email.trim() || "GV";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "GV";
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read profile image."));
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  useSEO(PAGE_SEO.profile);
  const { user, profile, isAdmin, tier, isLoading, isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState<ProfilePreferences>(() => readLocalPreferences());
  const [contextFraming, setContextFraming] = useState<string>(() => readLocalContextFraming());
  const [openSection, setOpenSection] = useState("identity");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [localAvatarPreviewUrl, setLocalAvatarPreviewUrl] = useState("");
  const counts = getRuntimeArtifactCounts();
  const selectedProfile = getProfileBySlug(preferences.embodimentProfileSlug);
  const displayName = preferences.displayName.trim() || user?.email?.split("@")[0] || "Guest collaborator";
  const initials = initialsFor(displayName, user?.email ?? "");
  const portraitState = usePortrait(isAuthenticated ? user?.id ?? null : null, contextFraming);
  const personalityProfile = portraitState.profile;
  const showSignedOutPrompt = !isLoading && !isAuthenticated;

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let mounted = true;

    const loadPreferences = async () => {
      const result = await appFetchJson<ProfilePreferencesResponse>("/api/profile/preferences", {
        timeoutMs: 5_000,
        retries: 0,
      });

      if (!mounted || !result.ok) {
        return;
      }

      setPreferences(result.data.preferences);
      writeLocalPreferences(result.data.preferences);
    };

    void loadPreferences();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      if (localAvatarPreviewUrl) {
        URL.revokeObjectURL(localAvatarPreviewUrl);
      }
    };
  }, [localAvatarPreviewUrl]);

  useEffect(() => {
    writeLocalContextFraming(contextFraming);
  }, [contextFraming]);

  const updatePreferences = (next: ProfilePreferences) => {
    setPreferences(next);
    writeLocalPreferences(next);
  };

  const savePreferences = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    writeLocalPreferences(preferences);

    if (!isAuthenticated) {
      toast.message("Saved profile preferences locally.");
      setIsSaving(false);
      return;
    }

    const result = await appFetchJson<ProfilePreferencesResponse>("/api/profile/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferences }),
      timeoutMs: 8_000,
      retryUnsafe: true,
    });

    setIsSaving(false);

    if (!result.ok) {
      toast.error(result.message || "Saved locally, but server preferences did not update.");
      return;
    }

    setPreferences(result.data.preferences);
    writeLocalPreferences(result.data.preferences);
    toast.success("Profile preferences saved.");
  };

  const handleAvatarFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file for your profile.");
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      toast.error("Profile images need to be 5 MB or smaller.");
      return;
    }

    if (!isAuthenticated || !user?.id) {
      const objectUrl = URL.createObjectURL(file);
      setLocalAvatarPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return objectUrl;
      });
      toast.message("Previewing locally. Sign in to save this profile image.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const fileRecord: UserFileRecord = createUserFileRecord({
        userId: user.id,
        file,
        roomOrigin: "unknown",
        previewUrl: dataUrl,
        dataUrl,
      });

      const uploadedFile = await uploadUserFileToServer({
        file: fileRecord,
        content: file.name,
        base64DataUrl: dataUrl,
      });

      appendUserFile(uploadedFile ?? fileRecord);

      if (!uploadedFile?.previewUrl) {
        const objectUrl = URL.createObjectURL(file);
        setLocalAvatarPreviewUrl((current) => {
          if (current) {
            URL.revokeObjectURL(current);
          }
          return objectUrl;
        });
        toast.error("Could not sync the profile image. Kept a local preview.");
        return;
      }

      updatePreferences({ ...preferences, avatarUrl: uploadedFile.previewUrl });
      toast.success("Profile image uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload profile image.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (showSignedOutPrompt) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#05070B] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 14% 12%, rgba(127,233,255,0.2), transparent 24%), radial-gradient(circle at 78% 18%, rgba(0,255,148,0.12), transparent 20%), radial-gradient(circle at 50% 84%, rgba(255,214,102,0.1), transparent 28%)",
          }}
        />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl items-center px-4 py-24 sm:px-6 lg:px-8">
          <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#7fe9ff]">Profile room</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Sign in to open your profile</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
              Your identity cards, portrait, and saved profile settings stay behind the auth boundary.
              Sign in to view and edit the profile room.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login?redirect=/profile">
                <a className="inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-300/16">
                  Open sign-in
                </a>
              </Link>
              <Link href="/">
                <a className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition-colors hover:text-white">
                  Back to GestaltView
                </a>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070B] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 14% 12%, rgba(127,233,255,0.2), transparent 24%), radial-gradient(circle at 78% 18%, rgba(0,255,148,0.12), transparent 20%), radial-gradient(circle at 50% 84%, rgba(255,214,102,0.1), transparent 28%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <RoomIdentityHeader
          roomName="Profile"
          purpose="Identity, embodiment context, export, and account boundary in one room-coherent surface."
          diName={selectedProfile.publicName}
          diArchetype={selectedProfile.immutableCore.archetype || "Your workspace"}
          status={isAdmin ? "founder access" : "private workspace"}
        />

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <GlassCard glow="none" intensity="medium" className="border-white/12 bg-white/[0.05] p-6 sm:p-7" hover={false}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#7fe9ff]">Identity room</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{displayName}</h1>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {selectedProfile.immutableCore.archetype || "Your workspace"} connected to a private runtime profile.
                </p>
              </div>
              <RoomStateBadge slug="profile" />
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border border-white/12 bg-black/30 text-3xl font-semibold text-[#7fe9ff]">
                {localAvatarPreviewUrl || preferences.avatarUrl ? (
                  <img src={localAvatarPreviewUrl || preferences.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{user?.email ?? "Not signed in"}</p>
                <p className="mt-1 text-sm text-white/52">
                  Tier {tier}, {profile?.isAdmin ? "founder/admin" : "member"} access.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/sanctuary">
                    <a className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70 hover:text-white">
                      Sanctuary
                    </a>
                  </Link>
                  <Link href="/blackboard-room">
                    <a className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70 hover:text-white">
                      Blackboard
                    </a>
                  </Link>
                  <Link href="/dynamic-inner-world">
                    <a className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70 hover:text-white">
                      Inner World
                    </a>
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Stat label="Captures" value={counts.totalCaptures.toString()} />
              <Stat label="Blueprints" value={counts.blueprints.toString()} />
              <Stat label="Approved" value={counts.approved.toString()} />
              <Stat label="Saved" value={counts.saved.toString()} />
            </div>
          </GlassCard>

          <div className="space-y-4">
            <ProfileDrawer
              id="identity"
              title="Identity"
              icon={<UserRound className="size-4" />}
              openSection={openSection}
              onOpen={setOpenSection}
            >
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">Display name</span>
                <input
                  value={preferences.displayName}
                  onChange={(event) => updatePreferences({ ...preferences, displayName: event.target.value })}
                  placeholder="Name this workspace"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#7fe9ff]/45"
                />
              </label>

              <label className="mt-4 block">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">Email</span>
                <input
                  value={user?.email ?? "Sign in to bind this profile to an account"}
                  readOnly
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60 outline-none"
                />
              </label>

              <div className="mt-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">Avatar upload</span>
                <label className="mt-2 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-white/14 bg-black/20 px-4 py-4 text-sm text-white/64 transition-colors hover:border-[#7fe9ff]/35 hover:text-white">
                  <span className="flex items-center gap-2">
                    <Upload className="size-4 text-[#7fe9ff]" />
                    {isUploadingAvatar ? "Uploading profile image..." : "Upload an image for this room profile"}
                  </span>
                  <input type="file" accept="image/*" onChange={(event) => void handleAvatarFile(event)} className="sr-only" disabled={isUploadingAvatar} />
                </label>
              </div>

              <SaveButton onClick={savePreferences} disabled={isSaving || isLoading} label={isSaving ? "Saving..." : "Save identity"} />
            </ProfileDrawer>

            <ProfileDrawer
              id="embodiment"
              title="Embodiment context"
              icon={<Brain className="size-4" />}
              openSection={openSection}
              onOpen={setOpenSection}
            >
              <p className="text-sm leading-relaxed text-white/58">
                Choose the non-founder DI profile associated with this account. This stores the profile slug in
                `user_preferences.embodiment_profile_slug` when the server preference route is available.
              </p>
              <select
                value={preferences.embodimentProfileSlug}
                onChange={(event) => updatePreferences({ ...preferences, embodimentProfileSlug: event.target.value })}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#7fe9ff]/45"
              >
                {ASSIGNABLE_PROFILES.map((embodiment) => (
                  <option key={embodiment.slug} value={embodiment.slug} className="bg-[#05070B] text-white">
                    {embodiment.publicName} — {embodiment.immutableCore.archetype}
                  </option>
                ))}
              </select>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{selectedProfile.publicName}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/56">
                  {selectedProfile.immutableCore.foundationalTruth || selectedProfile.originContext}
                </p>
              </div>
              <SaveButton onClick={savePreferences} disabled={isSaving || isLoading} label={isSaving ? "Saving..." : "Save embodiment context"} />
            </ProfileDrawer>

            <ProfileDrawer
              id="export"
              title="Data & export"
              icon={<Download className="size-4" />}
              openSection={openSection}
              onOpen={setOpenSection}
            >
              <p className="text-sm leading-relaxed text-white/58">
                The Mass Exodus export gathers local room data, journals, scrapbook items, blueprints, artifacts, insights, and profile metadata into a portable archive.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <MassExodusButton sourceSurface="profile" />
                <Link href="/settings">
                  <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition-colors hover:text-white">
                    Settings
                    <ArrowRight className="size-4" />
                  </a>
                </Link>
              </div>
            </ProfileDrawer>

            <ProfileDrawer
              id="danger"
              title="Danger zone"
              icon={<AlertTriangle className="size-4" />}
              openSection={openSection}
              onOpen={setOpenSection}
            >
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
                <p className="text-sm font-semibold text-amber-100">Account deletion is request-only for now.</p>
                <p className="mt-2 text-sm leading-relaxed text-amber-100/62">
                  No destructive backend action runs from this button. Send a founder request so deletion can be handled deliberately.
                </p>
                <a
                  href={`mailto:${FOUNDER_CONTACT_EMAIL}?subject=GestaltView%20account%20deletion%20request`}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-black/20 px-4 py-2.5 text-sm text-amber-100 transition-colors hover:bg-black/30"
                >
                  <Mail className="size-4" />
                  Request account deletion
                </a>
              </div>
            </ProfileDrawer>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="size-5 text-[#7fe9ff]" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">Portrait Profile</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/58">
                The latest validated portrait is surfaced here so the profile room shows the same live identity signal
                used in Sanctuary and Dynamic Inner World.
              </p>
            </div>
          </div>

          <ProfileDisplay
            userId={user?.id ?? "guest"}
            profile={portraitState.profile}
            portrait={portraitState.portrait}
            contextFraming={contextFraming}
            isLoading={portraitState.isLoading}
            onRefreshRequest={portraitState.refetch}
          />
        </section>

        <section className="mt-12">
          <ProfileIngestPanel
            userId={user?.id ?? null}
            contextFraming={contextFraming}
            onFramingChange={setContextFraming}
            onIngested={portraitState.refetch}
          />
        </section>

        {personalityProfile && (
          <section className="mt-12">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-[#7fe9ff]" />
                <h2 className="text-2xl font-semibold tracking-tight text-white">Your Personality Dimensions</h2>
              </div>
              {personalityProfile.coreNarrative && (
                <p className="mt-3 text-sm leading-relaxed text-white/62 italic">"{personalityProfile.coreNarrative}"</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {personalityProfile.dimensions.map((dimension) => (
                <PersonalityDimensionCard key={dimension.dimensionId} dimension={dimension} />
              ))}
            </div>

            {personalityProfile.keyThemes.length > 0 && (
              <div className="mt-8 rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="size-4 text-cyan-300" />
                  <h3 className="font-semibold text-white">Key Themes</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {personalityProfile.keyThemes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {personalityProfile.unresolvedTensions.length > 0 && (
              <div className="mt-4 rounded-[1.5rem] border border-amber-300/20 bg-amber-300/5 p-6">
                <h3 className="font-semibold text-amber-100 mb-4">Unresolved Tensions</h3>
                <ul className="space-y-2">
                  {personalityProfile.unresolvedTensions.map((tension, idx) => (
                    <li key={idx} className="flex gap-3 text-xs text-amber-100/76">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-300" />
                      {tension}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        <section className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Your GestaltView Module Landscape</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/58">
              {buildProfileModuleLandscapeCopy(MODULES.length)}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/52">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#7fe9ff]" />
            <p>
              Profile changes are written locally first. Signed-in sessions also attempt server persistence through the
              profile preferences route so the same identity context can follow the account.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProfileDrawer({
  id,
  title,
  icon,
  openSection,
  onOpen,
  children,
}: {
  id: string;
  title: string;
  icon: ReactNode;
  openSection: string;
  onOpen: (id: string) => void;
  children: ReactNode;
}) {
  const open = openSection === id;

  return (
    <GlassCard glow="none" intensity="medium" className="overflow-hidden border-white/12 bg-white/[0.05]" hover={false}>
      <button
        type="button"
        onClick={() => onOpen(open ? "" : id)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span className="rounded-full border border-white/10 bg-black/25 p-2 text-[#7fe9ff]">{icon}</span>
          <span className="text-sm font-semibold text-white">{title}</span>
        </span>
        <ChevronDown className={["size-4 text-white/42 transition-transform", open ? "rotate-180" : ""].join(" ")} />
      </button>
      {open ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-white/10 px-5 py-5"
        >
          {children}
        </motion.div>
      ) : null}
    </GlassCard>
  );
}

function SaveButton({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#7fe9ff]/20 bg-[#7fe9ff]/10 px-4 py-2.5 text-sm text-white transition-colors hover:border-[#7fe9ff]/35 hover:bg-[#7fe9ff]/15 disabled:cursor-wait disabled:opacity-60"
    >
      <Save className="size-4 text-[#7fe9ff]" />
      {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </motion.div>
  );
}

function ModuleCard({ module }: { module: ModuleDefinition }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Link href={module.route}>
        <a
          className="flex h-full flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 transition-all hover:border-white/20 hover:bg-white/[0.08]"
          style={{ borderColor: `${module.color}20` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-white">{module.name}</h3>
              {module.description && (
                <p className="mt-2 text-xs leading-relaxed text-white/56">{module.description}</p>
              )}
            </div>
            <ExternalLink className="size-4 shrink-0 text-white/40 transition-colors group-hover:text-white/60" style={{ color: `${module.color}66` }} />
          </div>
          <div className="mt-auto flex items-center justify-between">
            <span className="rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-white/50">
              {module.id}
            </span>
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: module.color }} />
          </div>
        </a>
      </Link>
    </motion.div>
  );
}

function PersonalityDimensionCard({ dimension }: { dimension: PersonalityDimension }) {
  const salience = Math.round(dimension.salience * 100);
  const confidence = Math.round(dimension.confidence * 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 hover:border-white/20 hover:bg-white/[0.08] transition-all"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm">{dimension.dimensionLabel}</h3>
          <p className="mt-1 text-xs text-white/52 font-mono">{dimension.dimensionKey}</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-full px-2 py-1 bg-cyan-300/10 border border-cyan-300/20">
            <span className="text-xs text-cyan-200">+{salience}%</span>
          </div>
        </div>
      </div>
      
      <p className="text-xs leading-relaxed text-white/62 mb-3">{dimension.dimensionValue.summary}</p>
      
      {dimension.dimensionValue.traits.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">Traits</p>
          <div className="flex flex-wrap gap-1.5">
            {dimension.dimensionValue.traits.slice(0, 3).map((trait, idx) => (
              <span
                key={idx}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-white/58"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-[9px] font-mono text-white/32">{dimension.mutationClass}</span>
        <span className="text-[9px] text-white/40">confidence {confidence}%</span>
      </div>
    </motion.div>
  );
}
