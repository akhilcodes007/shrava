"use client";

import { motion } from "framer-motion";
import { VoiceState } from "@/stores/voiceStore";
import { AssistantState } from "@/stores/assistantStore";

export type CoreVisualState = VoiceState | AssistantState;

interface ShravaEnergyRingProps {
  state: CoreVisualState;
}

export function ShravaEnergyRing({ state }: ShravaEnergyRingProps) {
  const isError = state === "ERROR";
  const ringColor = isError ? "border-red-500/30" : "border-cyan-400/30";

  return (
    <div className="absolute inset-0 m-auto w-[220px] h-[220px] rounded-full pointer-events-none flex items-center justify-center">
      {/* Outer pulsing ring for active states */}
      {(state === "LISTENING" || state === "SPEAKING") && (
        <>
          <motion.div
            className={`absolute inset-0 rounded-full border-2 ${ringColor}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1.5, 2.2],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
          <motion.div
            className={`absolute inset-0 rounded-full border border-cyan-300/30`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: [0.9, 1.3, 1.8],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.4,
            }}
          />
        </>
      )}

      {/* Persistent subtle ring */}
      <motion.div
        className={`absolute inset-0 rounded-full border border-white/10`}
        animate={{
          scale: state === "THINKING" ? [1, 0.9, 1] : state === "SUCCESS" ? [1, 1.1, 1] : [1, 1.02, 1],
          opacity: state === "THINKING" ? [0.2, 0.8, 0.2] : 0.4,
        }}
        transition={{
          duration: state === "THINKING" ? 1.5 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
