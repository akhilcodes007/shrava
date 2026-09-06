import { create } from 'zustand';

interface UIStore {
  isChatVisible: boolean;
  setChatVisible: (visible: boolean) => void;
  isSettingsVisible: boolean;
  setSettingsVisible: (visible: boolean) => void;
  isActivityVisible: boolean;
  setActivityVisible: (visible: boolean) => void;
  isDevelopmentMode: boolean;
  setDevelopmentMode: (enabled: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isChatVisible: false,
  setChatVisible: (visible) => set({ isChatVisible: visible }),
  isSettingsVisible: false,
  setSettingsVisible: (visible) => set({ isSettingsVisible: visible }),
  isActivityVisible: false,
  setActivityVisible: (visible) => set({ isActivityVisible: visible }),
  isDevelopmentMode: process.env.NODE_ENV === 'development',
  setDevelopmentMode: (enabled) => set({ isDevelopmentMode: enabled }),
}));
