"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

/**
 * One navy light source for the whole page, which travels as you scroll.
 *
 * Before this, each section painted its own static radial "lift". That reads as
 * a series of separate rooms with separate lamps. A single light that moves
 * down and across as you go from section to section reads as one building being
 * walked through — which is closer to what the page is about.
 *
 * How it moves: scroll progress drives a slow vertical sweep and a gentler
 * horizontal one, on different periods so the path never repeats exactly and
 * never looks like it is on rails. The element is `position: fixed`, so the
 * light stays in view while the content moves past it.
 *
 * Cost: two CSS custom properties written at most once per animation frame, on
 * a passive scroll listener. No React re-renders, no layout reads beyond
 * `scrollY`, and nothing paints unless the values actually changed.
 *
 * With prefers-reduced-motion it renders once, centred and still. The
 * atmosphere survives; the travel does not.
 */

/** Where the light sits at the very top and the very bottom of the page, in %. */
const TOP = { x: 50, y: 34 };
const SWEEP = { x: 26, y: 22 };

export function AmbientGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion) {
      // The preference resolves a tick after mount, so this effect may have
      // already run once and written a position. Clear it, or the light would
      // stay frozen wherever the visitor happened to have scrolled to.
      element.style.removeProperty("--glow-x");
      element.style.removeProperty("--glow-y");
      return;
    }

    let frame = 0;
    let lastX = -1;
    let lastY = -1;

    const apply = () => {
      frame = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      const clamped = progress < 0 ? 0 : progress > 1 ? 1 : progress;

      // Vertical: a smoothstep, so the light only ever descends. A sine here
      // looked better on paper and worse in practice — it lifted back up over
      // the last third, and a light that climbs while you scroll down reads as
      // a bug rather than as drift.
      const eased = clamped * clamped * (3 - 2 * clamped);
      const y = TOP.y + SWEEP.y * eased;

      // Horizontal: just over two crossings across the page, which lands at
      // roughly one lean per section — enough that moving between sections
      // feels like the light moved with you.
      const x = TOP.x + Math.sin(clamped * Math.PI * 2.1) * SWEEP.x;

      // Round before comparing: sub-0.1% moves are invisible and would repaint
      // on every frame of every scroll.
      const rx = Math.round(x * 10) / 10;
      const ry = Math.round(y * 10) / 10;
      if (rx === lastX && ry === lastY) return;
      lastX = rx;
      lastY = ry;
      element.style.setProperty("--glow-x", `${rx}%`);
      element.style.setProperty("--glow-y", `${ry}%`);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={ref}
      aria-hidden
      // Fixed and behind everything. `-z-10` would escape the stacking context
      // the page content sits in, so it is pinned at 0 and simply rendered
      // first — every section that follows paints over it.
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          "radial-gradient(115% 78% at var(--glow-x, 50%) var(--glow-y, 34%), rgba(18,44,78,0.72) 0%, rgba(9,26,50,0.34) 42%, rgba(1,8,22,0) 68%)",
      }}
    />
  );
}
