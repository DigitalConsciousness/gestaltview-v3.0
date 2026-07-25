import type * as React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "agent-id"?: string;
        "signed-url"?: string;
        "server-location"?: string;
        variant?: string;
        dismissible?: string;
        language?: string;
        "action-text"?: string;
        "start-call-text"?: string;
        "end-call-text"?: string;
        "expand-text"?: string;
        "listening-text"?: string;
        "speaking-text"?: string;
        "avatar-image-url"?: string;
        "avatar-orb-color-1"?: string;
        "avatar-orb-color-2"?: string;
        "dynamic-variables"?: string;
        "override-language"?: string;
        "override-prompt"?: string;
        "override-first-message"?: string;
        "override-voice-id"?: string;
      };
    }
  }
}

export {};
