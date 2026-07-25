import React from "react";
import { motion } from "framer-motion";
import { useBilly } from "./Billy";

interface BillyChipProps {
  /** Optional click handler — e.g. open the /billy page */
  onClick?: () => void;
  /** Optional home navigation action */
  onHomeClick?: () => void;
  /** Optional section context for legacy callers */
  context?: string;
}

/**
 * BillyChip — Inline status badge for Billy.
 * Derives its own `active` state from BillyContext (isListening || isLoading)
 * so it always reflects live Billy state without needing manual prop threading.
 *
 * Usage: <BillyChip onClick={() => navigate('/billy')} />
 */
const BillyChip: React.FC<BillyChipProps> = ({ onClick, onHomeClick }) => {
  const { isListening, isLoading } = useBilly();
  const active = isListening || isLoading;

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => event.key === "Enter" && onClick() : undefined}
      className="flex items-center gap-3 px-3 py-2 rounded-full bg-[#0A0F14] border border-[#00D4FF]/20 shadow-[0_0_20px_-10px_#00D4FF] cursor-pointer select-none"
      style={{ transition: "border-color 0.2s" }}
    >
      <div className="relative">
        <motion.div
          animate={{ scale: active ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-2 h-2 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]"
        />
        {active && (
          <motion.div
            className="absolute inset-0 rounded-full border border-[#00D4FF]"
            animate={{ scale: [1, 2], opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] font-bold tracking-widest text-[#00D4FF] font-mono leading-none">
          BILLY
        </span>
        <span className="text-[8px] text-gray-500 font-mono leading-none mt-1">
          {isListening ? "LISTENING..." : isLoading ? "THINKING..." : "STANDBY"}
        </span>
      </div>

      {onHomeClick && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onHomeClick();
          }}
          className="ml-1 px-2 py-1 rounded-full border border-[#00D4FF]/30 text-[8px] font-mono tracking-widest text-[#00D4FF] bg-[#050A0E]"
          aria-label="Navigate to home"
        >
          HOME
        </button>
      )}
    </div>
  );
};

export default BillyChip;
