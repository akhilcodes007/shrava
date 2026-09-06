"use client";

import { useState, useEffect } from "react";
import { useVoiceStore } from "@/stores/voiceStore";
import { useAssistantStore } from "@/stores/assistantStore";
import { ShravaInnerCore } from "./core/ShravaInnerCore";
import { ShravaEnergyRing } from "./core/ShravaEnergyRing";
import { ShravaOrbit } from "./core/ShravaOrbit";
import { ShravaParticles } from "./core/ShravaParticles";
import { ShravaWaveform } from "./core/ShravaWaveform";
import { ShravaStateText } from "./core/ShravaStateText";
import { audioAnalyzer } from "@/lib/audio/AudioAnalyzer";

export function ShravaCore() {
  const { state: voiceState, audioAmplitude: fallbackAmplitude } = useVoiceStore();
  const { statusMessage } = useAssistantStore();
  const [amplitude, setAmplitude] = useState(0);

  useEffect(() => {
    const unsubscribe = audioAnalyzer.subscribe((state) => {
      setAmplitude(state.amplitude);
    });
    return unsubscribe;
  }, []);

  // Use real amplitude if it's non-zero, else fallback to store (for legacy fake sine wave if needed)
  const effectiveAmplitude = amplitude > 0 ? amplitude : fallbackAmplitude;

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center select-none">
      {/* Container for all core visual elements */}
      <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
        <ShravaParticles state={voiceState} amplitude={effectiveAmplitude} />
        <ShravaOrbit state={voiceState} />
        <ShravaEnergyRing state={voiceState} />
        <ShravaInnerCore state={voiceState} amplitude={effectiveAmplitude} />
        <ShravaWaveform state={voiceState} amplitude={effectiveAmplitude} />
      </div>
      
      {/* State Text positioned below the core */}
      <ShravaStateText state={voiceState} statusMessage={statusMessage} />
    </div>
  );
}
