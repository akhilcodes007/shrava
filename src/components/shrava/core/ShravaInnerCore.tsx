"use client";

import { motion } from "framer-motion";
import { VoiceState } from "@/stores/voiceStore";
import { AssistantState } from "@/stores/assistantStore";

export type CoreVisualState = VoiceState | AssistantState;

interface ShravaInnerCoreProps {
  state: CoreVisualState;
  amplitude?: number;
}

export function ShravaInnerCore({ state, amplitude = 0 }: ShravaInnerCoreProps) {
  // Determine scale and glow based on state
  let scale = 1;
  let glowOpacity = 0.5;

  switch (state) {
    case "LISTENING":
      scale = 1.1 + amplitude * 0.2;
      glowOpacity = 0.8;
      break;
    case "THINKING":
      scale = 0.95;
      glowOpacity = 0.4;
      break;
    case "SPEAKING":
      scale = 1.0 + amplitude * 0.4;
      glowOpacity = 1;
      break;
    case "EXECUTING":
      scale = 1.2;
      glowOpacity = 0.9;
      break;
    case "ERROR":
      scale = 0.9;
      glowOpacity = 0.3;
      break;
    default: // IDLE, INTERRUPTED
      scale = 1;
      glowOpacity = 0.5;
  }

  const isError = state === "ERROR";
  const color = isError ? "rgba(239, 68, 68, 1)" : "rgba(6, 182, 212, 1)";
  const shadowColor = isError ? "rgba(239, 68, 68, 0.4)" : "rgba(6, 182, 212, 0.4)";

  return (
    <motion.div
      className="absolute inset-0 m-auto rounded-full flex items-center justify-center mix-blend-screen"
      style={{
        width: "140px",
        height: "140px",
        background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
      }}
      animate={{
        scale,
        opacity: glowOpacity,
        boxShadow: `0 0 80px 30px ${shadowColor}, inset 0 0 40px 10px ${shadowColor}`,
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 0.8,
      }}
    >
      <motion.div 
        className="w-16 h-16 rounded-full bg-white blur-[4px]"
        animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute w-8 h-8 rounded-full bg-white blur-[1px]"
        animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
