import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { thinkingMessages } from "@/lib/thinkingMessages";
import "./ThinkingAnimation.css";

export interface ThinkingAnimationProps {
  diName?: string;
  messages?: string[];
  interval?: number;
  className?: string;
  icon?: ReactNode;
}

function shuffleIndices(length: number, previousIndex?: number) {
  const indices = Array.from({ length }, (_, index) => index);

  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indices[index], indices[swapIndex]] = [indices[swapIndex], indices[index]];
  }

  if (previousIndex !== undefined && length > 1 && indices[0] === previousIndex) {
    const swapIndex = indices.findIndex((value) => value !== previousIndex);
    if (swapIndex > 0) {
      [indices[0], indices[swapIndex]] = [indices[swapIndex], indices[0]];
    }
  }

  return indices;
}

function normalizeMessages(messages?: string[]) {
  const source = (messages?.length ? messages : thinkingMessages)
    .map((message) => message.trim())
    .filter(Boolean);

  return source.length > 0 ? source : thinkingMessages;
}

function replaceDiPlaceholder(message: string, diName: string) {
  return message.replace(/\{DI\}/g, diName);
}

function DefaultThinkingIcon() {
  return (
    <svg viewBox="0 0 48 48" className="gv-thinking-icon-svg" aria-hidden="true">
      <circle cx="24" cy="24" r="15" />
      <circle cx="24" cy="15" r="2.5" />
      <circle cx="33" cy="27" r="2.5" />
      <circle cx="17" cy="31" r="2.5" />
      <path d="M24 17.5v5.5" />
      <path d="M21 29l-2.5 1.2" />
      <path d="M27.6 25.7 31 26.8" />
    </svg>
  );
}

export function ThinkingAnimation({
  diName = "Billy",
  messages,
  interval = 4000,
  className,
  icon,
}: ThinkingAnimationProps) {
  const sourceMessages = useMemo(() => normalizeMessages(messages), [messages]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const queueRef = useRef<number[]>([]);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    if (sourceMessages.length === 0) {
      queueRef.current = [];
      activeIndexRef.current = 0;
      setActiveIndex(0);
      return;
    }

    if (prefersReducedMotion || sourceMessages.length === 1) {
      queueRef.current = [];
      activeIndexRef.current = 0;
      setActiveIndex(0);
      return;
    }

    const nextQueue = shuffleIndices(sourceMessages.length, activeIndexRef.current);
    const [nextIndex, ...rest] = nextQueue;

    activeIndexRef.current = nextIndex ?? 0;
    queueRef.current = rest;
    setActiveIndex(nextIndex ?? 0);
  }, [prefersReducedMotion, sourceMessages]);

  useEffect(() => {
    if (prefersReducedMotion || sourceMessages.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => {
        if (queueRef.current.length === 0) {
          queueRef.current = shuffleIndices(sourceMessages.length, currentIndex);
        }

        const [nextIndex, ...rest] = queueRef.current;
        queueRef.current = rest;
        activeIndexRef.current = nextIndex ?? currentIndex;

        return nextIndex ?? currentIndex;
      });
    }, interval);

    return () => {
      window.clearInterval(timer);
    };
  }, [interval, prefersReducedMotion, sourceMessages.length]);

  const activeMessage = replaceDiPlaceholder(
    sourceMessages[activeIndex] ?? sourceMessages[0] ?? thinkingMessages[0],
    diName,
  );

  const rootClassName = ["gv-thinking-animation", className].filter(Boolean).join(" ");

  return (
    <div
      className={rootClassName}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${diName} is thinking: ${activeMessage}`}
      style={{ ["--thinking-interval" as string]: `${interval}ms` }}
    >
      <div className="gv-thinking-icon" aria-hidden="true">
        {icon ?? <DefaultThinkingIcon />}
      </div>
      <div className="gv-thinking-copy">
        <p className="gv-thinking-name">{diName}</p>
        <p key={activeMessage} className="gv-thinking-message">
          {activeMessage}
        </p>
      </div>
    </div>
  );
}

export default ThinkingAnimation;

