import { create } from 'zustand';

export type VoiceState = 
  | 'IDLE'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'INTERRUPTED'
  | 'ERROR';

interface VoiceStore {
  state: VoiceState;
  setState: (state: VoiceState) => void;
  isMicrophoneActive: boolean;
  setMicrophoneActive: (active: boolean) => void;
  audioAmplitude: number;
  setAudioAmplitude: (amplitude: number) => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  state: 'IDLE',
  setState: (state) => set({ state }),
  isMicrophoneActive: false,
  setMicrophoneActive: (active) => set({ isMicrophoneActive: active }),
  audioAmplitude: 0,
  setAudioAmplitude: (amplitude) => set({ audioAmplitude: amplitude }),
}));
