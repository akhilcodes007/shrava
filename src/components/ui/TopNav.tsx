"use client";

import { useUIStore } from "@/stores/uiStore";
import { useAssistantStore } from "@/stores/assistantStore";
import { useVoiceStore } from "@/stores/voiceStore";

export function TopNav() {
  const { 
    isChatVisible, setChatVisible, 
    isSettingsVisible, setSettingsVisible,
    isActivityVisible, setActivityVisible
  } = useUIStore();
  
  const { state: assistantState } = useAssistantStore();
  const { state: voiceState } = useVoiceStore();

  // Determine system status
  let systemStatus = "SYSTEM ONLINE";
  if (voiceState === "LISTENING") systemStatus = "LISTENING";
  else if (voiceState === "THINKING" || assistantState === "PROCESSING") systemStatus = "PROCESSING";
  else if (voiceState === "SPEAKING") systemStatus = "SPEAKING";
  else if (assistantState === "EXECUTING") systemStatus = "EXECUTING";
  else if (assistantState === "CONFIRMATION") systemStatus = "AWAITING APPROVAL";
  else if (voiceState === "ERROR" || assistantState === "ERROR") systemStatus = "ERROR";

  const currentTime = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });

  const navItems = [
    { name: "CHAT", active: isChatVisible, onClick: () => { setChatVisible(!isChatVisible); setSettingsVisible(false); setActivityVisible(false); } },
    { name: "MEMORY", active: false, onClick: () => {} }, // Placeholder
    { name: "ACTIVITY", active: isActivityVisible, onClick: () => { setActivityVisible(!isActivityVisible); setChatVisible(false); setSettingsVisible(false); } },
    { name: "SETTINGS", active: isSettingsVisible, onClick: () => { setSettingsVisible(!isSettingsVisible); setChatVisible(false); setActivityVisible(false); } },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 h-24 px-6 md:px-12 flex items-start justify-between z-50 pt-8 pointer-events-none">
      
      {/* Left side: Branding & Navigation */}
      <div className="flex flex-col gap-6 pointer-events-auto">
        <span className="font-mono text-sm tracking-[0.25em] font-medium text-white/90">
          SHRAVA
        </span>
        
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={item.onClick}
              className={`font-mono text-[10px] tracking-widest transition-colors ${
                item.active ? "text-cyan-400" : "text-white/40 hover:text-white/80"
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Right side: Status Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${systemStatus === 'ERROR' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'}`} />
          <span className="font-mono text-[10px] tracking-widest text-white/60">
            {systemStatus}
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-white/30 ml-2">
          {currentTime}
        </span>
      </div>
    </header>
  );
}
