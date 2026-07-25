/**
 * VoiceMicButton.tsx — Universal Voice Input Button
 * GestaltView v6 — Keith Soyka
 *
 * Drop-in mic button for any chat window.
 * Shows audio level ring animation while listening.
 */

import { useVoiceChat, type VoiceChatOptions } from "../hooks/useVoiceChat";

interface VoiceMicButtonProps extends VoiceChatOptions {
  /** Size in pixels, defaults to 32 */
  size?: number;
  /** Color theme: "emerald" | "purple" | "teal" | "red" */
  theme?: "emerald" | "purple" | "teal" | "red";
  /** Additional class names */
  className?: string;
  /** Show tooltip on hover */
  tooltip?: boolean;
}

const THEME_COLORS = {
  emerald: { active: "#22ee8d", idle: "rgba(34,238,141,0.35)", ring: "rgba(34,238,141,0.2)" },
  purple:  { active: "#8b5cf6", idle: "rgba(139,92,246,0.35)",  ring: "rgba(139,92,246,0.2)" },
  teal:    { active: "#0dd9e6", idle: "rgba(13,217,230,0.35)",  ring: "rgba(13,217,230,0.2)" },
  red:     { active: "#ef4444", idle: "rgba(239,68,68,0.35)",   ring: "rgba(239,68,68,0.2)" },
};

export function VoiceMicButton({
  size = 32,
  theme = "emerald",
  className = "",
  tooltip = true,
  ...voiceOptions
}: VoiceMicButtonProps) {
  const { isListening, isSupported, audioLevel, error, toggle } = useVoiceChat(voiceOptions);
  const colors = THEME_COLORS[theme];

  if (!isSupported) return null;

  const ringScale = isListening ? 1 + audioLevel * 0.6 : 1;
  const ringOpacity = isListening ? 0.4 + audioLevel * 0.5 : 0;

  return (
    <button
      type="button"
      onClick={toggle}
      title={tooltip ? (error ?? (isListening ? "Stop listening" : "Voice input")) : undefined}
      className={className}
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `1px solid ${isListening ? colors.active : colors.idle}`,
        background: isListening ? `${colors.active}18` : "transparent",
        color: isListening ? colors.active : colors.idle,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
        flexShrink: 0,
        outline: "none",
      }}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
      aria-pressed={isListening}
    >
      {/* Audio level ring */}
      {isListening && (
        <span
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            border: `2px solid ${colors.active}`,
            opacity: ringOpacity,
            transform: `scale(${ringScale})`,
            transition: "transform 0.05s, opacity 0.05s",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Mic icon */}
      {isListening ? (
        // Stop / mic-off icon
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      ) : (
        // Mic icon
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      )}
    </button>
  );
}
