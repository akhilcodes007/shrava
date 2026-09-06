"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAssistantStore } from "@/stores/assistantStore";

export function ConfirmationDialog() {
  const { state, setState, addActivity } = useAssistantStore();

  const isVisible = state === "CONFIRMATION";

  const handleApprove = () => {
    addActivity("Action approved by user");
    setState("EXECUTING");
    setTimeout(() => {
      setState("SUCCESS");
      addActivity("Action executed successfully");
      setTimeout(() => setState("READY"), 3000);
    }, 2000);
  };

  const handleCancel = () => {
    addActivity("Action cancelled by user");
    setState("READY");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        >
          <div className="pointer-events-auto bg-shrava-panel backdrop-blur-2xl border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400">
                ACTION REQUIRES APPROVAL
              </span>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-white font-medium">Send message to Alex</h3>
                <p className="text-white/60 text-sm italic">
                  &quot;I&apos;ll meet you at 6 PM.&quot;
                </p>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-colors font-medium text-sm"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all font-medium text-sm"
                >
                  APPROVE
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
