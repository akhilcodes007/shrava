"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageSquare, Plus } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useAssistantStore } from "@/stores/assistantStore";
import { useConversationStore } from "@/stores/conversationStore";

export function ChatWorkspace() {
  const { isChatVisible, setChatVisible } = useUIStore();
  const { state: assistantState, setState: setAssistantState, addActivity, setFallbackUsed, setActiveProvider, setLastError } = useAssistantStore();
  const { messages, addMessage, appendChunk, clearConversation, updateMessage } = useConversationStore();
  const [input, setInput] = useState("");
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatVisible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || assistantState === "PROCESSING") return;

    const userMsg = input.trim();
    setInput("");
    
    // Add user message
    addMessage({ role: 'user', content: userMsg, source: 'chat', status: 'success' });
    addActivity(`User message received: "${userMsg.slice(0, 20)}..."`);
    setAssistantState("PROCESSING");
    
    // Create assistant message placeholder
    const assistantMsgId = Date.now().toString() + Math.random().toString(36).substring(7);
    addMessage({ role: 'assistant', content: '', source: 'chat', status: 'sending', id: assistantMsgId });
    
    try {
      // Get history
      const history = useConversationStore.getState().messages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
      });

      if (!res.ok) throw new Error("API request failed");
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No readable stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunks = decoder.decode(value, { stream: true }).split("\n").filter(Boolean);
        for (const chunkStr of chunks) {
          try {
            const event = JSON.parse(chunkStr);
            
            if (event.type === "start") {
              setActiveProvider(event.provider || null);
              if (event.provider === "OpenAI") {
                setFallbackUsed(true);
                addActivity("Using OpenAI fallback");
              } else {
                addActivity(`Using ${event.provider || "AI Provider"}`);
              }
            } else if (event.type === "chunk" && event.content) {
              appendChunk(assistantMsgId, event.content);
            } else if (event.type === "error") {
              setLastError(event.error);
              addActivity(`Provider Error: ${event.error}`);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
      updateMessage(assistantMsgId, { status: 'success' });
      setAssistantState("SUCCESS");
      addActivity("Responded to user message");
      setTimeout(() => setAssistantState("READY"), 2000);
    } catch (error) {
      console.error(error);
      updateMessage(assistantMsgId, { status: 'error', content: "Sorry, an error occurred." });
      setAssistantState("ERROR");
      setTimeout(() => setAssistantState("READY"), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isChatVisible && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 bottom-0 w-full md:w-[450px] bg-shrava-panel backdrop-blur-3xl border-l border-white/5 z-40 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs uppercase tracking-widest text-white/50">
                Workspace
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => clearConversation()}
                className="p-2 text-white/40 hover:text-white/80 transition-colors rounded-full hover:bg-white/5"
                title="New Chat"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setChatVisible(false)}
                className="p-2 text-white/40 hover:text-white/80 transition-colors rounded-full hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-cyan-500/10 text-cyan-50 border border-cyan-500/20 rounded-tr-sm' 
                      : 'bg-white/5 text-white/80 border border-white/5 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {assistantState === "PROCESSING" && (
              <div className="flex justify-start w-full">
                <div className="max-w-[85%] p-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/5 bg-black/20">
            <form 
              onSubmit={handleSubmit}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a command..."
                disabled={assistantState === "PROCESSING"}
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-14 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || assistantState === "PROCESSING"}
                className="absolute right-2 p-2 rounded-full text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
