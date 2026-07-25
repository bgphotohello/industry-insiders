"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import type { ElementType, ReactNode } from "react";

type MaskedHeadingProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  id?: string;
};

/**
 * Editorial heading reveal: the text rises from behind a mask rather than
 * fading in place. The mask is a plain overflow-hidden wrapper — no clip-path
 * animation, no per-word splitting, so the text stays selectable, searchable
 * and correctly read aloud.
 *
 * Descenders need headroom, hence the small vertical padding compensated by an
 * equal negative margin.
 */
export function MaskedHeading({
  children,
  className,
  as: Component = "h2",
  delay = 0,
  id,
}: MaskedHeadingProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <Component className={className} id={id}>
        {children}
      </Component>
    );
  }

  return (
    <Component className={className} id={id}>
      {/*
        The in-view trigger MUST sit on the mask, not on the text inside it.
        IntersectionObserver measures an element's *clipped* rectangle, so a
        child parked below an overflow-hidden parent reports zero intersection
        and would wait forever to be revealed. The mask is never clipped, so it
        observes correctly and drives the child through variants.
      */}
      <motion.span
        className="block overflow-hidden py-[0.12em] my-[-0.12em]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -14% 0px" }}
      >
        <motion.span
          className="block"
          data-motion-reveal=""
          variants={{ hidden: { y: "108%" }, visible: { y: "0%" } }}
          transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.span>
      </motion.span>
    </Component>
  );
}
