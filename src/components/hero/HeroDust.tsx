"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

import { createHeroDust, type HeroDustHandle } from "./hero-dust";

/**
 * Mounts the ambient hero dust. Purely decorative, so it is hidden from
 * assistive technology and never carries meaning.
 */
export function HeroDust({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let handle: HeroDustHandle | null = null;
    // Wait a frame so the canvas has been laid out before it is measured.
    const raf = window.requestAnimationFrame(() => {
      handle = createHeroDust(canvas, { reducedMotion: prefersReducedMotion });
    });

    return () => {
      window.cancelAnimationFrame(raf);
      handle?.destroy();
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
    />
  );
}
