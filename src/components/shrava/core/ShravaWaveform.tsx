"use client";

import { motion } from "framer-motion";
import { VoiceState } from "@/stores/voiceStore";
import { AssistantState } from "@/stores/assistantStore";

export type CoreVisualState = VoiceState | AssistantState;

interface ShravaWaveformProps {
  state: CoreVisualState;
  amplitude?: number;
}

export function ShravaWaveform({ state, amplitude = 0 }: ShravaWaveformProps) {
  if (state !== "LISTENING" && state !== "SPEAKING") {
    return null;
  }

  // Generate 5 bars for a simple waveform
  const bars = [0, 1, 2, 3, 4];
  const color = "bg-cyan-400";

  return (
    <div className="absolute inset-0 m-auto w-32 h-32 flex items-center justify-center gap-1.5 opacity-60">
      {bars.map((i) => {
        // Base height depends on position (center is taller)
        const baseHeight = i === 2 ? 24 : i === 1 || i === 3 ? 16 : 8;
        // Use deterministic pseudo-randomness based on index and amplitude
        const pseudoRandom = Math.abs(Math.sin((i + 1) * 12.3456));
        const dynamicHeight = baseHeight + pseudoRandom * (amplitude * 40);

        return (
          <motion.div
            key={i}
            className={`w-1 rounded-full ${color}`}
            animate={{ height: `${dynamicHeight}px` }}
            transition={{ type: "tween", duration: 0.1 }}
          />
        );
      })}
    </div>
  );
}
