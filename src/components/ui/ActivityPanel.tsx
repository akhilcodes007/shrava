"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAssistantStore } from "@/stores/assistantStore";
import { useUIStore } from "@/stores/uiStore";
import { X, Activity } from "lucide-react";

export function ActivityPanel() {
  const { activities } = useAssistantStore();
  const { isActivityVisible, setActivityVisible } = useUIStore();

  return (
    <AnimatePresence>
      {isActivityVisible && (
        <motion.div
          initial={{ opacity: 0, x: -400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -400 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute left-0 top-0 bottom-0 w-full md:w-[400px] bg-shrava-panel backdrop-blur-2xl border-r border-white/5 z-40 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs uppercase tracking-widest text-white/50">
                System Activity
              </span>
            </div>
            <button
              onClick={() => setActivityVisible(false)}
              className="p-2 text-white/40 hover:text-white/80 transition-colors rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="relative border-l border-white/10 ml-3 space-y-8">
              {activities.map((activity) => (
                <div key={activity.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/40">
                      {activity.time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <p className="text-sm text-white/80 font-medium">
                      {activity.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
