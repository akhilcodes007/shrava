import { create } from 'zustand';

export type AssistantState = 
  | 'READY'
  | 'PROCESSING'
  | 'EXECUTING'
  | 'CONFIRMATION'
  | 'SUCCESS'
  | 'ERROR';

export interface ActivityLog {
  id: string;
  time: Date;
  message: string;
}

interface AssistantStore {
  state: AssistantState;
  setState: (state: AssistantState) => void;
  statusMessage: string;
  setStatusMessage: (message: string) => void;
  
  // Phase 3 Extensions
  activeProvider: string | null;
  setActiveProvider: (provider: string | null) => void;
  fallbackUsed: boolean;
  setFallbackUsed: (used: boolean) => void;
  lastError: string | null;
  setLastError: (error: string | null) => void;
  
  activities: ActivityLog[];
  addActivity: (message: string) => void;
}

export const useAssistantStore = create<AssistantStore>((set) => ({
  state: 'READY',
  setState: (state) => set({ state }),
  statusMessage: 'Online',
  setStatusMessage: (message) => set({ statusMessage: message }),
  
  activeProvider: null,
  setActiveProvider: (provider) => set({ activeProvider: provider }),
  fallbackUsed: false,
  setFallbackUsed: (used) => set({ fallbackUsed: used }),
  lastError: null,
  setLastError: (error) => set({ lastError: error }),

  activities: [
    { id: Date.now().toString(), time: new Date(), message: "System initialized" }
  ],
  addActivity: (message) => 
    set((state) => ({
      activities: [
        { id: Date.now().toString(), time: new Date(), message },
        ...state.activities,
      ].slice(0, 50) // Keep last 50 activities
    })),
}));
