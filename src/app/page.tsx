import { ShravaCore } from "@/components/shrava/ShravaCore";
import { VoiceControls } from "@/components/ui/VoiceControls";
import { TopNav } from "@/components/ui/TopNav";
import { DevControls } from "@/components/ui/DevControls";
import { ChatWorkspace } from "@/components/ui/ChatWorkspace";
import { ActivityPanel } from "@/components/ui/ActivityPanel";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

export default function Home() {
  return (
    <main className="relative w-full h-[100dvh] overflow-hidden bg-background flex flex-col items-center justify-center">
      {/* Background radial gradient for subtle depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.02)_0%,transparent_80%)] pointer-events-none" />
      
      <TopNav />
      <DevControls />
      
      {/* Slide-over panels */}
      <ChatWorkspace />
      <ActivityPanel />
      
      {/* Main Core Area */}
      <div className="relative z-10 w-full max-w-4xl flex-1 flex flex-col items-center justify-center mt-12 mb-24">
        <ShravaCore />
      </div>

      <VoiceControls />
      <ConfirmationDialog />
    </main>
  );
}
