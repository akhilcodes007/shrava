"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceStore } from "@/stores/voiceStore";
import { useAssistantStore } from "@/stores/assistantStore";
import { useConversationStore } from "@/stores/conversationStore";
import { audioAnalyzer } from "@/lib/audio/AudioAnalyzer";
import { cn } from "@/lib/utils";

export function VoiceControls() {
  const { state, setState, setMicrophoneActive } = useVoiceStore();
  const { addActivity, setFallbackUsed, setActiveProvider, setLastError } = useAssistantStore();
  const { addMessage } = useConversationStore();

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const stopSpeaking = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    audioAnalyzer.disconnect();
    setState("IDLE");
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      setState("THINKING");
      addActivity("Transcribing audio (ElevenLabs STT)...");
      
      const formData = new FormData();
      formData.append("file", audioBlob);
      
      // STT
      const sttRes = await fetch("/api/stt", { method: "POST", body: formData });
      if (!sttRes.ok) throw new Error("STT failed");
      const sttData = await sttRes.json();
      const transcript = sttData.transcript;
      
      if (!transcript) {
        setState("IDLE");
        return;
      }

      addMessage({ role: 'user', content: transcript, source: 'voice', status: 'success' });
      addActivity(`User said: "${transcript}"`);

      // AI Request
      addActivity("Querying AI Provider Router...");
      abortControllerRef.current = new AbortController();
      
      // Get conversation history to send
      const history = useConversationStore.getState().messages.map(m => ({ role: m.role, content: m.content }));
      
      const aiRes = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: abortControllerRef.current.signal
      });

      if (!aiRes.ok) throw new Error("AI request failed");
      
      const reader = aiRes.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No readable stream");

      let aiResponseText = "";

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
                addActivity(`Using ${event.provider}`);
              }
            } else if (event.type === "chunk" && event.content) {
              aiResponseText += event.content;
            } else if (event.type === "error") {
              setLastError(event.error);
              throw new Error(`AI Error: ${event.error}`);
            }
          } catch (_e) {
            // parse error
          }
        }
      }

      addMessage({ role: 'assistant', content: aiResponseText, source: 'voice', status: 'success' });
      addActivity("Synthesizing speech (ElevenLabs TTS)...");

      // TTS
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiResponseText }),
        signal: abortControllerRef.current.signal
      });

      if (!ttsRes.ok) throw new Error("TTS failed");
      
      const audioBlobResult = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlobResult);
      
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      
      audio.onplay = () => {
        setState("SPEAKING");
        addActivity("Speaking...");
        audioAnalyzer.connect(audio);
      };
      
      audio.onended = () => {
        audioAnalyzer.disconnect();
        setState("IDLE");
      };

      await audio.play();

    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        addActivity("Interrupted.");
      } else {
        console.error(error);
        addActivity(`Voice Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        setState("IDLE");
      }
    }
  };

  const handleToggleMic = async () => {
    if (state === "SPEAKING") {
      setState("INTERRUPTED");
      stopSpeaking();
      return;
    }

    if (state === "LISTENING") {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    } else if (state === "IDLE" || state === "INTERRUPTED") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        
        audioChunksRef.current = [];
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        
        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          stream.getTracks().forEach(t => t.stop());
          processAudio(audioBlob);
        };
        
        recorder.start();
        setMediaRecorder(recorder);
        setState("LISTENING");
        setMicrophoneActive(true);
      } catch (e) {
        console.error("Microphone access denied", e);
        addActivity("Microphone access denied");
      }
    }
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isListening = state === "LISTENING";
  const isSpeaking = state === "SPEAKING";
  const isThinking = state === "THINKING";

  return (
    <div className="absolute bottom-12 left-0 right-0 flex flex-col justify-center items-center gap-4 z-40">
      
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="font-mono text-[10px] tracking-widest text-white/50 uppercase"
        >
          {isSpeaking ? "Tap to interrupt" : isListening ? "Listening..." : isThinking ? "Processing..." : "Tap to speak"}
        </motion.span>
      </AnimatePresence>

      <button
        onClick={handleToggleMic}
        className={cn(
          "relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500",
          "border backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
          isListening 
            ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_40px_rgba(6,182,212,0.4)] text-cyan-400 scale-110"
            : isSpeaking
            ? "border-cyan-300 bg-cyan-400/20 shadow-[0_0_50px_rgba(6,182,212,0.5)] text-cyan-200 scale-110"
            : isThinking
            ? "border-white/20 bg-white/5 text-white/50 cursor-wait"
            : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/30 hover:scale-105 hover:text-white"
        )}
        disabled={isThinking}
        aria-label={isSpeaking ? "Stop speaking" : "Start speaking"}
      >
        {isSpeaking ? (
          <Square className="w-5 h-5 fill-current" />
        ) : isThinking ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
