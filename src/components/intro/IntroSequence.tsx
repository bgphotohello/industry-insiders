"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { useCallback, useEffect, useRef, useState } from "react";

import { BRAND_FILES, BrandLogo } from "@/components/brand/BrandLogo";
import { brand } from "@/content/site";
import { createParticleField, type ParticleFieldHandle } from "./particle-field";

/**
 * Which intro a visitor gets.
 *   full    — first visit this session: dust drifts, converges, reveals
 *   quick   — later visits this session: a fast, dignified fade, no particles
 *   reduced — prefers-reduced-motion: a plain cross-fade, same hierarchy
 */
type IntroMode = "full" | "quick" | "reduced";

const SESSION_KEY = "ii:intro-seen:v1";

/**
 * Stage gates, in milliseconds from mount, per mode. The full sequence lands at
 * ~4.45s of content plus a 0.6s exit — inside the 3.5–5s brief.
 */
const SCHEDULE: Record<
  IntroMode,
  { mark: number; wordmark: number; tagline: number; exit: number; done: number }
> = {
  full: { mark: 2950, wordmark: 3250, tagline: 4000, exit: 4450, done: 5050 },
  quick: { mark: 120, wordmark: 300, tagline: 620, exit: 900, done: 1300 },
  reduced: { mark: 60, wordmark: 200, tagline: 420, exit: 800, done: 1150 },
};

type Stage = "particles" | "mark" | "wordmark" | "tagline" | "exit" | "done";

const STAGE_ORDER: Stage[] = [
  "particles",
  "mark",
  "wordmark",
  "tagline",
  "exit",
  "done",
];

function atLeast(stage: Stage, min: Stage): boolean {
  return STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf(min);
}

export function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // `null` until the client has decided. The server and the first client render
  // agree on "not decided yet", so there is no hydration mismatch, and the
  // overlay is a plain navy panel until the effect runs a tick later.
  const [mode, setMode] = useState<IntroMode | null>(null);
  const [stage, setStage] = useState<Stage>("particles");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<ParticleFieldHandle | null>(null);
  const timers = useRef<number[]>([]);
  const completed = useRef(false);
  /** null until the session has been checked; then true if already seen. */
  const seenThisSession = useRef<boolean | null>(null);

  const clearTimers = useCallback(() => {
    for (const timer of timers.current) window.clearTimeout(timer);
    timers.current = [];
  }, []);

  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    setStage("done");
    onComplete();
  }, [onComplete]);

  /** Skip control and the Escape key both land here. */
  const skip = useCallback(() => {
    clearTimers();
    fieldRef.current?.destroy();
    fieldRef.current = null;
    setStage("exit");
    timers.current.push(window.setTimeout(finish, 420));
  }, [clearTimers, finish]);

  // --- Decide which intro to run, once, on the client. ---------------------
  useEffect(() => {
    // The session flag is read AND written exactly once per mount, guarded by
    // a ref. Reading it inline on every run looks equivalent but is not: this
    // effect re-runs when the motion preference resolves, and StrictMode
    // double-invokes effects in development. A second pass would read back the
    // "1" it had just written and demote a genuine first visit to the fast
    // intro — so in `npm run dev` the full reveal would essentially never play.
    if (seenThisSession.current === null) {
      let seen = false;
      try {
        seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Private browsing or storage disabled: fall back to the full intro.
        // Better to over-deliver than to fail.
      }
      seenThisSession.current = seen;
    }

    setMode(
      prefersReducedMotion
        ? "reduced"
        : seenThisSession.current
          ? "quick"
          : "full",
    );
  }, [prefersReducedMotion]);

  // --- Drive the stage timeline. -------------------------------------------
  useEffect(() => {
    if (!mode) return;
    const schedule = SCHEDULE[mode];

    const push = (delay: number, next: Stage) => {
      timers.current.push(
        window.setTimeout(() => setStage(next), Math.max(0, delay)),
      );
    };

    push(schedule.mark, "mark");
    push(schedule.wordmark, "wordmark");
    push(schedule.tagline, "tagline");
    push(schedule.exit, "exit");
    timers.current.push(window.setTimeout(finish, schedule.done));

    return clearTimers;
  }, [mode, finish, clearTimers]);

  // --- Particle field: full mode only. -------------------------------------
  useEffect(() => {
    if (mode !== "full") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let handle: ParticleFieldHandle | null = null;

    const startField = (markImage: HTMLImageElement | null) => {
      if (cancelled) return;
      handle = createParticleField({
        canvas,
        markImage,
        getMarkRect: () => {
          const element = markRef.current;
          const host = canvas.parentElement;
          if (!element || !host) return null;
          const markBox = element.getBoundingClientRect();
          const hostBox = host.getBoundingClientRect();
          if (markBox.width === 0 || markBox.height === 0) return null;
          return {
            left: markBox.left - hostBox.left,
            top: markBox.top - hostBox.top,
            width: markBox.width,
            height: markBox.height,
          };
        },
      });
      fieldRef.current = handle;
    };

    // Sample the real brand file so the dust forms whatever artwork is in
    // /public/brand. If it is missing or slow, fall back to the inline
    // geometry rather than delaying the intro.
    const image = new Image();
    let settled = false;
    const settle = (value: HTMLImageElement | null) => {
      if (settled) return;
      settled = true;
      startField(value);
    };

    image.onload = () => settle(image);
    image.onerror = () => settle(null);
    image.src = BRAND_FILES.mark;
    const fallbackTimer = window.setTimeout(() => settle(null), 400);

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      handle?.destroy();
      fieldRef.current = null;
    };
  }, [mode]);

  // --- Escape skips; scroll is locked while the overlay is up. -------------
  useEffect(() => {
    if (stage === "done") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") skip();
    };

    document.body.dataset.introActive = "true";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      delete document.body.dataset.introActive;
    };
  }, [stage, skip]);

  const showMark = atLeast(stage, "mark");
  const showWordmark = atLeast(stage, "wordmark");
  const showTagline = atLeast(stage, "tagline");
  const exiting = atLeast(stage, "exit");
  const letters = [...brand.wordmark];

  return (
    <AnimatePresence>
      {stage !== "done" && (
        <motion.div
          id="intro-overlay"
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden bg-navy-950"
          initial={{ opacity: 1 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          // A shorter hand-off with reduced motion, so the curtain and the hero
          // are not legible on top of each other for any noticeable time.
          transition={{
            duration: mode === "reduced" ? 0.3 : 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          // The page beneath is fully rendered and readable; this is a visual
          // curtain, so it is announced as such rather than as content.
          role="presentation"
        >
          {/* Depth: a single soft radial lift, no orbs, no blur stack. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 42%, rgba(16,38,66,0.85) 0%, rgba(6,20,38,0) 62%)",
            }}
          />

          {mode === "full" && (
            <canvas
              ref={canvasRef}
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full"
            />
          )}

          <div className="relative flex -translate-y-[3vh] flex-col items-center px-6">
            {/* The mark. Opacity only — never scaled — so the hand-off from
                dust to vector reads as a focus pull, not a zoom. */}
            <motion.div
              ref={markRef}
              className="w-[min(62vw,260px)] text-champagne-500 md:w-[min(34vw,420px)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: showMark ? 1 : 0 }}
              transition={{ duration: mode === "full" ? 0.85 : 0.45, ease: "easeOut" }}
            >
              <BrandLogo
                variant="mark"
                width={200}
                height={120}
                priority
                className="h-auto w-full"
              />
            </motion.div>

            {/* Wordmark: masked, letter by letter. Read as one word by
                assistive tech via the label on the wrapper. */}
            {/* -mr compensates for the trailing letter-space the last glyph
                carries, which would otherwise push the wordmark off-centre
                under the mark. */}
            <div
              className="mt-8 flex overflow-hidden -mr-[0.42em] md:mt-10"
              aria-label={brand.name}
              role="img"
            >
              {letters.map((letter, index) => (
                <motion.span
                  key={`${letter}-${index}`}
                  aria-hidden
                  className="font-display text-[clamp(1.15rem,0.9rem+1.6vw,2.1rem)] font-light uppercase leading-none tracking-[0.42em] text-metal"
                  initial={{ y: "110%", opacity: 0 }}
                  animate={
                    showWordmark
                      ? { y: "0%", opacity: 1 }
                      : { y: "110%", opacity: 0 }
                  }
                  transition={{
                    duration: mode === "full" ? 0.75 : 0.4,
                    delay: showWordmark
                      ? index * (mode === "full" ? 0.045 : 0.012)
                      : 0,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {letter === " " ? " " : letter}
                </motion.span>
              ))}
            </div>

            <motion.p
              className="mt-6 text-center font-sans text-[0.72rem] font-light uppercase tracking-[0.28em] text-champagne-400/85 md:text-[0.78rem]"
              initial={{ opacity: 0 }}
              animate={{ opacity: showTagline ? 1 : 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              {brand.tagline}
            </motion.p>
          </div>

          {/* Discreet, always reachable, keyboard-first. */}
          <button
            type="button"
            onClick={skip}
            className="absolute bottom-8 right-6 font-sans text-[0.68rem] uppercase tracking-[0.28em] text-faint transition-colors duration-300 hover:text-champagne-300 md:bottom-10 md:right-10"
          >
            Skip Intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
