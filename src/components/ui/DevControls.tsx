"use client";

import { useVoiceStore, VoiceState } from "@/stores/voiceStore";
import { useUIStore } from "@/stores/uiStore";

const states: VoiceState[] = [
  "IDLE",
  "LISTENING",
  "THINKING",
  "SPEAKING",
  "INTERRUPTED",
  "ERROR",
];

export function DevControls() {
  const { state, setState } = useVoiceStore();
  const { isDevelopmentMode } = useUIStore();

  if (!isDevelopmentMode) return null;

  return (
    <div className="absolute top-24 left-8 p-4 rounded-xl bg-black/50 border border-white/10 backdrop-blur-md z-50 flex flex-col gap-2">
      <div className="text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
        Dev Controls
      </div>
      {states.map((s) => (
        <button
          key={s}
          onClick={() => setState(s)}
          className={`px-3 py-1.5 text-xs font-mono text-left rounded transition-colors ${
            state === s 
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
              : "text-white/60 hover:bg-white/5"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
