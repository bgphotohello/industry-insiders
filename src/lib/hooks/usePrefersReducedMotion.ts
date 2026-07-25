"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

/** The server has no display preference to read, so it always renders motion-on. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Whether the visitor has asked for reduced motion.
 *
 * Written by hand rather than using Motion's `useReducedMotion`: that hook
 * snapshots the media query into `useState` on first render, so a component
 * that hydrates before the preference is read keeps the wrong value forever —
 * which left every scroll-reveal stuck at opacity 0 for exactly the people who
 * most need the content to just be there.
 *
 * `useSyncExternalStore` re-reads on hydration and stays subscribed, so
 * toggling the OS setting updates the page live.
 *
 * Belt and braces: `globals.css` also forces reveal elements to their final
 * state under the same media query, so content is legible even if JavaScript
 * never runs.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
