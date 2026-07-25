"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

type RuleLineProps = {
  className?: string;
  delay?: number;
  /** "horizontal" expands left-to-right; "vertical" grows downward. */
  orientation?: "horizontal" | "vertical";
};

/**
 * A hairline champagne rule that draws itself into place on scroll.
 *
 * These rules are the site's main structural device — they divide the
 * editorial rows in place of cards or borders.
 */
export function RuleLine({
  className,
  delay = 0,
  orientation = "horizontal",
}: RuleLineProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isHorizontal = orientation === "horizontal";

  const base = isHorizontal
    ? "h-px w-full origin-left"
    : "w-px h-full origin-top";

  const style = {
    background: isHorizontal
      ? "linear-gradient(to right, rgba(200,161,90,0.42), rgba(200,161,90,0.06))"
      : "linear-gradient(to bottom, rgba(200,161,90,0.42), rgba(200,161,90,0.06))",
  };

  if (prefersReducedMotion) {
    return <span aria-hidden className={`${base} block ${className ?? ""}`} style={style} />;
  }

  return (
    <motion.span
      aria-hidden
      data-motion-reveal=""
      className={`${base} block ${className ?? ""}`}
      style={style}
      initial={isHorizontal ? { scaleX: 0 } : { scaleY: 0 }}
      whileInView={isHorizontal ? { scaleX: 1 } : { scaleY: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
