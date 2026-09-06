"use client";

import { useEffect, useRef } from "react";
import { VoiceState } from "@/stores/voiceStore";
import { AssistantState } from "@/stores/assistantStore";

export type CoreVisualState = VoiceState | AssistantState;

interface ShravaParticlesProps {
  state: CoreVisualState;
  amplitude?: number;
}

export function ShravaParticles({ state, amplitude = 0 }: ShravaParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed internal resolution for the particle field
    canvas.width = 400;
    canvas.height = 400;

    let animationFrameId: number;
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      angle: number;
      speed: number;
      distance: number;
      alpha: number;
    }> = [];

    const numParticles = 80;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Initialize particles
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: centerX,
        y: centerY,
        radius: Math.random() * 1.5 + 0.5,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
        distance: Math.random() * 150 + 50,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isThinking = state === "THINKING";
      const isSuccess = state === "SUCCESS";
      const isError = state === "ERROR";
      const baseColor = isError ? "239, 68, 68" : "6, 182, 212";

      // Check reduced motion inside render or once outside
      // (Checking once outside is better for perf but doing it here is fine since it's just a variable read)
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      particles.forEach((p) => {
        // Update angle for orbit effect, slow down if reduced motion
        const speedMultiplier = prefersReducedMotion ? 0.2 : (isThinking ? 3 : 1);
        p.angle += p.speed * speedMultiplier;

        // Determine particle distance based on state
        let currentDist = p.distance;
        if (isThinking) {
          // Inward pulling, subtle scanning
          currentDist = prefersReducedMotion ? p.distance * 0.8 : p.distance * 0.6 + Math.sin(Date.now() * 0.002 + p.angle) * 10;
        } else if (state === "SPEAKING") {
          currentDist = p.distance * (1 + amplitude * 0.5);
        } else if (isSuccess) {
          // Outward burst
          currentDist = prefersReducedMotion ? p.distance * 1.1 : p.distance * 1.5 + Math.sin(Date.now() * 0.005) * 20;
        }

        p.x = centerX + Math.cos(p.angle) * currentDist;
        p.y = centerY + Math.sin(p.angle) * currentDist;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${baseColor}, ${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, amplitude]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 m-auto w-[400px] h-[400px] pointer-events-none opacity-60"
    />
  );
}
