// © 2026 Keith Soyka — GestaltView
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
import { lazy, Suspense, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useLocation } from "wouter";
import Home from "./pages/Home";
import { BillyProvider } from "./components/Billy";
import { TopNav } from "./components/TopNav";
import BillyGreeter from "./components/BillyGreeter";
import { OpeningCeremony } from "./components/OpeningCeremony";
import { UpgradeBanner } from "./components/UpgradeBanner";
import { hasFounderTrainerControlPlaneAccess } from "./lib/agentTrainerAccess";
import { useBillyRuntimeReadiness } from "./hooks/useBillyRuntimeReadiness";

const DiligenceExplorer = lazy(() => import("./components/DiligenceExplorer"));
const CollaborationProofPage = lazy(() => import("./pages/CollaborationProofPage"));
const ResonanceLoopPage = lazy(async () => ({
  default: (await import("./pages/ResonanceLoopPage")).ResonanceLoopPage,
}));
const MusicalDNAPage = lazy(() => import("./pages/MusicalDNAPage"));
const BrainSparksPage = lazy(() => import("./pages/BrainSparksPage"));
const EthicsFrameworkPage = lazy(() => import("./pages/EthicsFrameworkPage"));
const EnginePage = lazy(() => import("./pages/EnginePage"));
const OrientationSlideshowPage = lazy(() => import("./pages/OrientationSlideshowPage"));
const BillyLive = lazy(() => import("./components/BillyLive"));
const BillyVoiceStudioPage = lazy(() => import("./pages/BillyVoiceStudioPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TribunalPage = lazy(() => import("./pages/TribunalPage"));
const CodexPage = lazy(() => import("./pages/CodexPage"));
const FAQPage = lazy(() => import("./pages/FAQ"));
const TermsPage = lazy(() => import("./pages/Terms"));
const ExhibitsIndex = lazy(() => import("./pages/ExhibitsIndex"));
const ContinuumCodexPage = lazy(() => import("./pages/ContinuumCodexPage"));
const AgentTrainerPage = lazy(() => import("./features/agent-trainer/AgentTrainerPage"));
const AgentTrainerPricing = lazy(() => import("./pages/AgentTrainerPricing"));
const GATEPackageBuilderPage = lazy(() => import("./pages/GATEPackageBuilderPage"));
const GATEOrderStatusPage = lazy(() => import("./pages/GATEOrderStatusPage"));
const HostedAgentTrainerPage = lazy(() => import("./pages/HostedAgentTrainerPage"));
const Pricing = lazy(() => import("./pages/Pricing"));
const DemoPage = lazy(() => import("./pages/Demo"));
const SignupPage = lazy(() => import("./pages/Signup"));
const AgentBuilderPage = lazy(() => import("./pages/AgentBuilder"));
const WorkspacesPage = lazy(() => import("./pages/WorkspacesPage"));
const DocumentsPage = lazy(() => import("./pages/DocumentsPage"));
const VoicePage = lazy(() => import("./pages/VoicePage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const SchemaDashboardPage = lazy(() => import("./pages/SchemaDashboardPage"));
const AgentTrainerDevCliPage = lazy(() => import("./pages/AgentTrainerDevCliPage"));
const Welcome = lazy(() => import("./pages/Welcome"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const SignIn = lazy(() => import("./pages/SignIn"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const FounderRuntimePage = lazy(() => import("./pages/FounderRuntimePage"));
const AlzheimersLegacyPage = lazy(() => import("./pages/AlzheimersLegacyPage"));
const ADHDPowerUpPage = lazy(() => import("./pages/ADHDPowerUpPage"));
const AddictionRecoveryPage = lazy(() => import("./pages/AddictionRecoveryPage"));
const ResumeRockstarDemo = lazy(() => import("./components/ResumeRockstarDemo"));
const SymbioCoderDemo = lazy(() => import("./components/SymbioCoderDemo"));
const VibeCoderDemo = lazy(() => import("./components/VibeCoderDemo"));
const ValidationWallPage = lazy(() => import("./components/ValidationWall"));
const VillageBuildersCovenant = lazy(() => import("./components/VillageBuildersCovenant"));
const BrainSparksStationPage = lazy(() => import("./components/BrainSparksStation"));
const MetricsDashboardPage = lazy(() => import("./pages/MetricsDashboardPage"));
const HeirloomCompanionPage = lazy(() => import("./pages/HeirloomCompanionPage"));
const BucketDropsPage = lazy(() => import("./pages/BucketDropsPage"));
const GravityInspectorPage = lazy(() => import("./pages/GravityInspectorPage"));
const ConsultingPage = lazy(() => import("./pages/ConsultingPage"));
const ExternalScaffoldPage = lazy(() => import("./pages/ExternalScaffoldPage"));
const PullStringPage = lazy(() => import("./pages/PullStringPage"));
const LivingLegacyPage = lazy(() => import("./pages/LivingLegacyPage"));
const RapidPrototypePage = lazy(() => import("./pages/RapidPrototypePage"));
const AdaptiveLayoutPage = lazy(() => import("./pages/AdaptiveLayoutPage"));
const CreationCornerPage = lazy(() => import("./pages/CreationCornerPage"));
const SanctuaryPage = lazy(() => import("./pages/SanctuaryPage"));
const OriginRoute = lazy(() => import("./routes/origin"));
const WorkspaceAnalysisPage = lazy(() => import("./pages/WorkspaceAnalysisPage"));
const BlackboardRoomPage = lazy(() => import("./pages/BlackboardRoomPage"));
const TranscriptoryPage = lazy(() => import("./pages/TranscriptoryPage"));
const DynamicInnerWorldPage = lazy(() => import("./pages/DynamicInnerWorldPage"));
const ArtifactGalleryPage = lazy(() => import("./pages/ArtifactGalleryPage"));
const MultiModalSandboxPage = lazy(() => import("./pages/MultiModalSandboxPage"));
const SandboxArtifactDetailPage = lazy(() => import("./pages/SandboxArtifactDetailPage"));
const DigitalIntelligenceAcademyPage = lazy(() => import("./pages/DigitalIntelligenceAcademyPage"));
const EmbodimentStudioPage = lazy(() => import("./pages/EmbodimentStudioPage"));
const AgentCouncilPage = lazy(() => import("./pages/AgentCouncilPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const SpotifyCallbackPage = lazy(() => import("./pages/SpotifyCallbackPage"));
// ── Modules ──────────────────────────────────────────────────────────────────
const ResumeRockstarModule = lazy(() => import("./modules/Resume_Rockstar"));
const SymbioCoderModule = lazy(() => import("./modules/Symbio_Coder"));
const VibeCoderModule = lazy(() => import("./modules/Vibe_Coder"));
const MasterclassPage = lazy(() => import("./pages/MasterclassPage"));
const MasterclassSessionPage = lazy(() => import("./pages/MasterclassSessionPage"));
// ── Sandbox ──────────────────────────────────────────────────────────────────
const SandboxPage = lazy(() => import("./pages/SandboxPage"));

function shouldShowRuntimeNav(pathname: string): boolean {
  return ![
    "/orientation",
    "/login",
    "/auth/consent",
    "/auth/consent/auth/callback",
    "/signup",
    "/auth/callback",
    "/spotify/callback",
    "/musical-dna/spotify/callback",
    "/contact",
    "/privacy",
    "/terms",
    "/faq",
    "/404",
  ].some((blocked) => pathname === blocked || pathname.startsWith(`${blocked}/`));
}

// ─── Route guard ─────────────────────────────────────────────────────────────
//
// Only keithsoyka@gmail.com (and any emails in VITE_FOUNDER_ADMIN_EMAILS) or
// users whose Supabase profile has is_admin = true may access the internal
// Agent Trainer control plane at /agent-trainer/control-plane.
//
// The public landing now routes to pricing, while the hosted runtime lives at
// /agent-trainer/runtime.
//
// During the auth loading window we render a blank dark screen matching the
// app background so there is no layout shift.

function ProtectedTrainerControlPlaneRoute() {
  const { isLoading, isAdmin, session, user } = useAuth();
  const hasAuthToken = Boolean(session?.access_token);

  if (isLoading || (user && !hasAuthToken)) {
    // Hold steady — don't redirect before we know who the user is.
    return <div className="min-h-screen bg-[#020617]" aria-hidden="true" />;
  }

  const hasAccess = hasAuthToken && hasFounderTrainerControlPlaneAccess({
    email: user?.email,
    isAdmin,
  });

  if (!hasAccess) {
    return <Redirect to="/agent-trainer" />;
  }

  return <AgentTrainerPage />;
}

function Router() {
  return (
    <Switch>
      {/* ── Core ── */}
      <Route path="/" component={Home} />
      <Route path="/engine" component={EnginePage} />
      <Route path="/codex" component={CodexPage} />
      <Route path="/agent-trainer/runtime" component={HostedAgentTrainerPage} />
      <Route path="/agent-trainer/pricing" component={AgentTrainerPricing} />
      <Route path="/agent-trainer/package-builder" component={GATEPackageBuilderPage} />
      <Route path="/agent-trainer/orders/:id" component={GATEOrderStatusPage} />
      {/* Protected: admin / founder-allowlist only */}
      <Route
        path="/agent-trainer/control-plane"
        component={ProtectedTrainerControlPlaneRoute}
      />
      <Route path="/agent-trainer" component={AgentTrainerPricing} />
      <Route path="/record" component={DiligenceExplorer} />
      <Route path="/billy/voicestudio" component={BillyVoiceStudioPage} />
      <Route path="/billy" component={BillyLive} />

      {/* ── Monetization + Auth ── */}
      <Route path="/pricing" component={Pricing} />
      <Route path="/demo" component={DemoPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/app/sandbox" component={MultiModalSandboxPage} />
      <Route path="/app/artifacts/:artifactId" component={SandboxArtifactDetailPage} />
      <Route path="/app" component={DashboardPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/founder-runtime" component={FounderRuntimePage} />
      <Route path="/workspaces" component={WorkspacesPage} />
      <Route path="/documents" component={DocumentsPage} />
      <Route path="/voice" component={VoicePage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/schema-dashboard" component={SchemaDashboardPage} />
      <Route path="/agent_builder" component={AgentBuilderPage} />
      <Route path="/agent-builder" component={AgentBuilderPage} />
      <Route path="/builder" component={AgentBuilderPage} />
      <Route path="/lair" component={HostedAgentTrainerPage} />
      <Route path="/agent-trainer/dev-cli" component={AgentTrainerDevCliPage} />
      <Route path="/consulting" component={ConsultingPage} />
      <Route path="/external-scaffold" component={ExternalScaffoldPage} />
      <Route path="/module/scaffold" component={ExternalScaffoldPage} />
      <Route path="/workspace" component={() => <Redirect to="/workspaces" />} />
      <Route path="/sanctuary" component={SanctuaryPage} />
      <Route path="/module/sanctuary" component={SanctuaryPage} />
      <Route path="/origin" component={OriginRoute} />
      <Route path="/module/pull-string" component={PullStringPage} />
      <Route path="/blackboard-room" component={BlackboardRoomPage} />
      <Route path="/transcriptory" component={TranscriptoryPage} />
      <Route path="/artifact-gallery" component={ArtifactGalleryPage} />
      <Route path="/dynamic-inner-world" component={DynamicInnerWorldPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/whiteboard-room" component={() => <Redirect to="/blackboard-room" />} />
      <Route path="/digital-intelligence-academy" component={DigitalIntelligenceAcademyPage} />
      <Route path="/module/agent-academy" component={DigitalIntelligenceAcademyPage} />
      <Route path="/embodiment-studio" component={EmbodimentStudioPage} />
      <Route path="/tribunal" component={AgentCouncilPage} />
      <Route path="/module/tribunal" component={AgentCouncilPage} />
      <Route path="/agent-council" component={() => <Redirect to="/tribunal" />} />
      <Route path="/module/agent-council" component={() => <Redirect to="/tribunal" />} />
      <Route path="/cog-os" component={() => <Redirect to="/engine" />} />
      <Route path="/pull-string" component={PullStringPage} />
      <Route path="/living-legacy" component={LivingLegacyPage} />
      <Route path="/rapid-prototype" component={RapidPrototypePage} />
      <Route path="/module/rpe" component={RapidPrototypePage} />
      <Route path="/adaptive-layout" component={AdaptiveLayoutPage} />
      <Route path="/creation-corner" component={CreationCornerPage} />
      <Route path="/module/creation-corner" component={CreationCornerPage} />
      <Route path="/workspace-analysis" component={WorkspaceAnalysisPage} />
      <Route path="/module/workspace-analysis" component={WorkspaceAnalysisPage} />
      <Route path="/login" component={SignIn} />
      <Route path="/auth/consent" component={SignIn} />
      <Route path="/auth/consent/auth/callback" component={AuthCallback} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/signin" component={() => <Redirect to="/login" />} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/spotify/callback" component={SpotifyCallbackPage} />
      <Route path="/musical-dna/spotify/callback" component={SpotifyCallbackPage} />

      {/* ── Demo & Exhibit pages ── */}
      <Route path="/alzheimers-legacy" component={AlzheimersLegacyPage} />
      <Route path="/daydreamer" component={AlzheimersLegacyPage} />
      <Route path="/addiction-recovery" component={AddictionRecoveryPage} />
      <Route path="/adhd-powerup" component={ADHDPowerUpPage} />
      <Route path="/musical-dna" component={MusicalDNAPage} />
      <Route path="/symbiocoder" component={SymbioCoderDemo} />
      <Route path="/vibe-coder" component={VibeCoderDemo} />
      <Route path="/resume-rockstar" component={ResumeRockstarDemo} />
      <Route path="/brain-sparks" component={BrainSparksPage} />
      <Route path="/continuum-codex" component={ContinuumCodexPage} />

      {/* ── New exhibit pages ── */}
      <Route path="/validation-wall" component={ValidationWallPage} />
      <Route path="/village-builders" component={VillageBuildersCovenant} />
      <Route path="/brain-sparks-station" component={BrainSparksStationPage} />
      <Route path="/metrics-dashboard" component={MetricsDashboardPage} />
      <Route path="/heirloom-companion" component={HeirloomCompanionPage} />
      <Route path="/bucket-drops" component={BucketDropsPage} />
      <Route path="/gravity" component={GravityInspectorPage} />

      {/* ── Info & Framework pages ── */}
      <Route path="/platform" component={() => <Redirect to="/dynamic-inner-world" />} />
      <Route path="/museum" component={() => <Redirect to="/dynamic-inner-world" />} />
      <Route path="/collaboration-proof" component={CollaborationProofPage} />
      <Route path="/resonance-loop" component={ResonanceLoopPage} />
      <Route path="/ethics-framework" component={EthicsFrameworkPage} />
      <Route path="/tribunal-of-understanding" component={TribunalPage} />
      <Route path="/orientation" component={OrientationSlideshowPage} />

      {/* ── Exhibits archive ── */}
      <Route path="/exhibits" component={ExhibitsIndex} />

      {/* ── Module workspace routes ── */}
      <Route path="/module/resume-rockstar" component={ResumeRockstarModule} />
      <Route path="/workspace/modules/resume-rockstar" component={ResumeRockstarModule} />
      <Route path="/module/symbio-coder" component={SymbioCoderModule} />
      <Route path="/workspace/modules/symbio-coder" component={SymbioCoderModule} />
      <Route path="/module/vibe-coder" component={VibeCoderModule} />
      <Route path="/workspace/modules/vibe-coder" component={VibeCoderModule} />
      <Route path="/module/masterclass" component={MasterclassPage} />
      <Route path="/workspace/modules/masterclass" component={MasterclassPage} />
      {/* DI session routes — /di/:slug is the canonical target from MasterclassPage */}
      <Route path="/di/:slug" component={MasterclassSessionPage} />
      <Route path="/module/masterclass/:slug" component={MasterclassSessionPage} />
      <Route path="/workspace/modules/masterclass/:slug" component={MasterclassSessionPage} />

      {/* ── Dev / Internal Tools ── */}
      <Route path="/sandbox" component={SandboxPage} />

      {/* ── Legal / Utility ── */}
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppInner() {
  const [location] = useLocation();
  const isSubPage = location !== "/";
  const runtimeReady = useBillyRuntimeReadiness();
  const [greeterDismissed, setGreeterDismissed] = useState(false);

  const [ceremonySeen, setCeremonySeen] = useState<boolean>(() => {
    try {
      return isSubPage || sessionStorage.getItem("gv-home-reveal-seen") === "true";
    } catch {
      return true;
    }
  });

  return (
    <>
      <Toaster />
      {/* Soft upgrade nudge — only visible to anonymous/free users, never blocks */}
      <UpgradeBanner />
      {shouldShowRuntimeNav(location) ? <TopNav /> : null}
      <AnimatePresence mode="wait">
        {!ceremonySeen ? (
          <OpeningCeremony key="ceremony" onComplete={() => setCeremonySeen(true)} />
        ) : (
          <Suspense key="platform" fallback={<div className="min-h-screen bg-[#0A0F14]" />}>
            <Router />
            {runtimeReady && !greeterDismissed && (location === "/" || location === "/welcome") ? (
              <BillyGreeter key="billy-greeter" onDismiss={() => setGreeterDismissed(true)} />
            ) : null}
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <BillyProvider>
              <AppInner />
              <Analytics />
              <SpeedInsights />
            </BillyProvider>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
