"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds. Used sparingly, to stagger siblings. */
  delay?: number;
  /** Travel distance in pixels. Kept low — this is a settle, not a slide. */
  distance?: number;
  as?: "div" | "li" | "section" | "span" | "p";
};

/**
 * The site's standard on-scroll entrance: a short, low-distance fade up that
 * runs once.
 *
 * With prefers-reduced-motion the element simply appears — no transform, no
 * opacity ramp — so nothing is ever gated behind motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 18,
  as = "div",
}: RevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const Component = motion[as];

  if (prefersReducedMotion) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Component
      className={className}
      data-motion-reveal=""
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}
