"use client";

import { motion } from "framer-motion";
import { VoiceState } from "@/stores/voiceStore";
import { AssistantState } from "@/stores/assistantStore";

export type CoreVisualState = VoiceState | AssistantState;

interface ShravaOrbitProps {
  state: CoreVisualState;
}

export function ShravaOrbit({ state }: ShravaOrbitProps) {
  const isError = state === "ERROR";
  const ringColor = isError ? "border-red-500/20" : "border-cyan-500/20";
  const nodeColor = isError ? "bg-red-400" : "bg-cyan-400";

  // Different speeds based on state
  let duration1 = 20;
  let duration2 = 15;
  let duration3 = 25;

  if (state === "THINKING" || state === "EXECUTING") {
    duration1 = 8;
    duration2 = 6;
    duration3 = 10;
  } else if (state === "LISTENING") {
    duration1 = 12;
    duration2 = 9;
    duration3 = 15;
  }

  return (
    <div className="absolute inset-0 m-auto w-[320px] h-[320px] pointer-events-none">
      {/* Outer Orbit */}
      <motion.div
        className={`absolute inset-0 m-auto w-[300px] h-[300px] rounded-full border border-dashed ${ringColor}`}
        animate={{ rotate: 360, scale: state === "SUCCESS" ? 1.05 : 1 }}
        transition={{ rotate: { duration: duration1, repeat: Infinity, ease: "linear" }, scale: { duration: 0.5 } }}
      >
        <div className={`absolute -top-1 left-1/2 w-2.5 h-2.5 -ml-[5px] rounded-full ${nodeColor} shadow-[0_0_12px_rgba(6,182,212,0.9)]`} />
      </motion.div>

      {/* Middle Orbit (reverse) */}
      <motion.div
        className={`absolute inset-0 m-auto w-[220px] h-[220px] rounded-full border border-solid border-white/5`}
        animate={{ rotate: -360, scale: state === "SUCCESS" ? 1.05 : 1 }}
        transition={{ rotate: { duration: duration2, repeat: Infinity, ease: "linear" }, scale: { duration: 0.5 } }}
      >
        <div className={`absolute top-[15%] left-[10%] w-1.5 h-1.5 rounded-full bg-cyan-200/60 shadow-[0_0_8px_rgba(6,182,212,0.6)]`} />
        <div className={`absolute bottom-[15%] right-[10%] w-1 h-1 rounded-full bg-white/40`} />
      </motion.div>

      {/* Inner Orbit */}
      <motion.div
        className={`absolute inset-0 m-auto w-[150px] h-[150px] rounded-full border border-solid border-white/10`}
        animate={{ rotate: 360, scale: state === "SUCCESS" ? 1.05 : 1 }}
        transition={{ rotate: { duration: duration3, repeat: Infinity, ease: "linear" }, scale: { duration: 0.5 } }}
      >
        <div className={`absolute -bottom-1 left-1/2 w-2 h-2 -ml-1 rounded-full ${nodeColor} shadow-[0_0_8px_rgba(6,182,212,0.6)]`} />
      </motion.div>
    </div>
  );
}
