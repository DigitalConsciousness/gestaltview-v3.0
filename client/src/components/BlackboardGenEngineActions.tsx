import { Zap, Sparkles, Send, Wand2, Brain } from "lucide-react";
import { toast } from "sonner";
import type { CaptureOrb } from "@/components/Scaffold";
import { scoreResonance, createArtifact } from "@/lib/genEngineClient";

interface BlackboardGenEngineActionsProps {
  selectedCapture: CaptureOrb | null;
  captures: CaptureOrb[];
  onMergeRequest?: () => void;
  onSendToCreationCorner?: () => void;
  onSendToDynamicInnerWorld?: () => void;
  isLoading?: boolean;
}

export default function BlackboardGenEngineActions({
  selectedCapture,
  captures,
  onMergeRequest,
  onSendToCreationCorner,
  onSendToDynamicInnerWorld,
  isLoading = false,
}: BlackboardGenEngineActionsProps) {
  const handleMerge = async () => {
    if (!selectedCapture) {
      toast.error("Select a capture to merge");
      return;
    }

    try {
      toast.loading("Checking resonance...");
      const resonance = await scoreResonance({
        text: selectedCapture.text,
      });

      if (resonance.score > 65) {
        toast.success(`High resonance (${resonance.score}/100). Ready to merge into blueprint.`);
        onMergeRequest?.();
      } else {
        toast.info(`Moderate resonance (${resonance.score}/100). Text preserved as-is.`);
      }
    } catch (error) {
      toast.error(String(error));
    }
  };

  const handleResonanceCheck = async () => {
    if (!selectedCapture) {
      toast.error("Select a capture to check resonance");
      return;
    }

    try {
      const resonance = await scoreResonance({
        text: selectedCapture.text,
      });

      const metaphors = resonance.metaphorsMatched.join(", ") || "none";
      toast.info(
        `Score: ${resonance.score}/100 • Energy: +${resonance.energyBoost.toFixed(1)} • Metaphors: ${metaphors}`,
        { duration: 5000 },
      );
    } catch (error) {
      toast.error(String(error));
    }
  };

  const handleBillyNameSuggestion = async () => {
    if (!selectedCapture) {
      toast.error("Select a capture for naming");
      return;
    }

    try {
      toast.loading("Billy is thinking of a shape name...");
      // This would call Billy's naming API in a full implementation
      // For now, suggest a pattern from the text
      const words = selectedCapture.text.split(/\s+/).filter((w) => w.length > 4);
      if (words.length > 0) {
        const suggestion = words[Math.floor(Math.random() * words.length)];
        toast.success(`Billy suggests: "${suggestion}"`);
      }
    } catch (error) {
      toast.error(String(error));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!selectedCapture || isLoading}
          onClick={handleMerge}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-100/5 px-3 py-1.5 text-xs font-medium text-cyan-100/80 transition-all hover:border-cyan-200/25 hover:bg-cyan-100/10 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Check PLK resonance and merge into blueprint if score is high"
        >
          <Zap className="h-3.5 w-3.5" />
          Merge to Blueprint
        </button>

        <button
          type="button"
          disabled={!selectedCapture || isLoading}
          onClick={handleResonanceCheck}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-purple-200/15 bg-purple-100/5 px-3 py-1.5 text-xs font-medium text-purple-100/80 transition-all hover:border-purple-200/25 hover:bg-purple-100/10 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Check language resonance score and metaphor matches"
        >
          <Brain className="h-3.5 w-3.5" />
          Resonance Check
        </button>

        <button
          type="button"
          disabled={!selectedCapture || isLoading}
          onClick={onSendToCreationCorner}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-100/5 px-3 py-1.5 text-xs font-medium text-emerald-100/80 transition-all hover:border-emerald-200/25 hover:bg-emerald-100/10 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Send capture to Creation Corner for synthesis"
        >
          <Send className="h-3.5 w-3.5" />
          to Creation Corner
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!selectedCapture || isLoading}
          onClick={onSendToDynamicInnerWorld}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-indigo-200/15 bg-indigo-100/5 px-3 py-1.5 text-xs font-medium text-indigo-100/80 transition-all hover:border-indigo-200/25 hover:bg-indigo-100/10 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Send capture to Dynamic Inner World for spatial preservation"
        >
          <Sparkles className="h-3.5 w-3.5" />
          to Dynamic Inner World
        </button>

        <button
          type="button"
          disabled={!selectedCapture || isLoading}
          onClick={handleBillyNameSuggestion}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-rose-200/15 bg-rose-100/5 px-3 py-1.5 text-xs font-medium text-rose-100/80 transition-all hover:border-rose-200/25 hover:bg-rose-100/10 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Ask Billy to suggest a shape name for this capture"
        >
          <Wand2 className="h-3.5 w-3.5" />
          Billy Names Shape
        </button>
      </div>

      {selectedCapture && captures.length > 1 ? (
        <p className="text-xs text-white/42">
          Gen-engine has {captures.length} captures available for synthesis and routing.
        </p>
      ) : null}
    </div>
  );
}
