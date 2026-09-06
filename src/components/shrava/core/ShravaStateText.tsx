"use client";

import { motion, AnimatePresence } from "framer-motion";
import { VoiceState } from "@/stores/voiceStore";
import { AssistantState } from "@/stores/assistantStore";

export type CoreVisualState = VoiceState | AssistantState;

interface ShravaStateTextProps {
  state: CoreVisualState;
  statusMessage?: string;
}

export function ShravaStateText({ state, statusMessage }: ShravaStateTextProps) {
  let displayText = statusMessage || "";
  
  if (!statusMessage) {
    switch (state) {
      case "LISTENING":
        displayText = "Listening...";
        break;
      case "THINKING":
        displayText = "Processing";
        break;
      case "SPEAKING":
        displayText = "Speaking";
        break;
      case "ERROR":
        displayText = "System Error";
        break;
      case "INTERRUPTED":
        displayText = "Interrupted";
        break;
      default:
        displayText = "Online";
    }
  }

  return (
    <div className="absolute top-[calc(50%+160px)] left-0 right-0 text-center pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={displayText}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="text-[11px] uppercase tracking-[0.2em] font-mono text-foreground/50"
        >
          {displayText}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
