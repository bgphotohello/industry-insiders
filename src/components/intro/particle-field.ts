import { MONOGRAM_SHAPES, MONOGRAM_VIEWBOX } from "@/lib/brand/monogram";

/**
 * The intro particle field.
 *
 * Fine champagne dust drifts in the dark, then is drawn — as if magnetised —
 * into the exact silhouette of the Industry Insider monogram, at which point
 * the crisp SVG takes over and the dust dissolves.
 *
 * Implementation notes that matter:
 *
 *  - The resting positions are not decorative guesses. The shared monogram
 *    paths are rasterised to a small offscreen canvas and sampled, so the dust
 *    genuinely settles into the mark, including the tiny Texas silhouette.
 *  - Everything is drawn to ONE canvas. There are no per-particle DOM nodes.
 *  - Particles are blitted from a single pre-rendered radial sprite with
 *    `lighter` compositing. No per-frame gradients, no shadowBlur — both are
 *    expensive enough to cost frames on mid-range phones.
 *  - Device pixel ratio is capped (1.5 on small screens, 2 elsewhere).
 *  - The clock only advances while the tab is visible, so a backgrounded tab
 *    burns no frames and the sequence does not silently run out while hidden.
 *  - There is no pointer interaction by design: the dust is atmosphere, not a
 *    toy, and reading cursor position would invite distortion effects.
 */

export type IntroPhase =
  | "drift"
  | "converge"
  | "settle"
  | "reveal"
  | "wordmark"
  | "complete";

/** Milliseconds from field start. Total runtime ≈ 4.4s before the exit fade. */
export const INTRO_TIMELINE = {
  driftUntil: 1100,
  convergeUntil: 2700,
  /** Crisp SVG begins cross-fading in over the settled dust. */
  revealAt: 2950,
  /** Wordmark letters begin their staggered reveal. */
  wordmarkAt: 3250,
  /** Tagline fades in last. */
  taglineAt: 4000,
  /** Whole overlay begins its exit. */
  completeAt: 4450,
} as const;

type Particle = {
  /** Current position, CSS pixels. */
  x: number;
  y: number;
  /** Resting position sampled from the monogram raster. */
  tx: number;
  ty: number;
  /** Position when convergence began, filled in on the first converge frame. */
  fx: number;
  fy: number;
  /** Drift parameters — a slow, wide lissajous so motion never looks looped. */
  ox: number;
  oy: number;
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  phase: number;
  /** Per-particle convergence stagger, 0–1 of the available lead-in. */
  delay: number;
  size: number;
  alpha: number;
  /** 0–1 across the three champagne tones. */
  tone: number;
  /** Shimmer offset so settled dust twinkles out of sync. */
  twinkle: number;
};

const TONES = ["200,161,90", "216,185,120", "231,210,163"] as const;

/** Deterministic PRNG — a fixed intro reads as designed, not accidental. */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/**
 * Rasterise the monogram and return one candidate resting point per opaque
 * pixel cluster, in CSS pixels relative to the canvas.
 *
 * When `markImage` is supplied — the real /public/brand/industry-insider-mark.svg,
 * preloaded by the caller — the dust assembles into THAT artwork. Replacing the
 * logo file therefore changes the intro animation too, with no code edits. If
 * the file is missing or fails to decode, the shared placeholder paths are
 * rasterised instead so the intro always has a shape to form.
 */
function sampleMonogramTargets(
  markLeft: number,
  markTop: number,
  markWidth: number,
  markHeight: number,
  count: number,
  random: () => number,
  markImage: HTMLImageElement | null,
): Array<{ x: number; y: number }> {
  // Sampling raster is capped independently of display size: 220px wide is
  // plenty of resolution to place a few hundred points, and keeps the
  // getImageData call cheap.
  const rasterWidth = Math.min(220, Math.max(120, Math.round(markWidth)));
  const rasterHeight = Math.max(
    1,
    Math.round((rasterWidth * markHeight) / markWidth),
  );

  const offscreen = document.createElement("canvas");
  offscreen.width = rasterWidth;
  offscreen.height = rasterHeight;
  const ctx = offscreen.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  if (markImage) {
    ctx.drawImage(markImage, 0, 0, rasterWidth, rasterHeight);
  } else {
    const scale = rasterWidth / MONOGRAM_VIEWBOX.width;
    ctx.fillStyle = "#fff";
    for (const shape of MONOGRAM_SHAPES) {
      ctx.save();
      ctx.scale(scale, scale);
      ctx.translate(shape.x, shape.y);
      ctx.scale(shape.scale, shape.scale);
      ctx.fill(new Path2D(shape.d));
      ctx.restore();
    }
  }

  const { data } = ctx.getImageData(0, 0, rasterWidth, rasterHeight);
  const opaque: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < rasterHeight; y += 1) {
    for (let x = 0; x < rasterWidth; x += 1) {
      const alpha = data[(y * rasterWidth + x) * 4 + 3] ?? 0;
      if (alpha > 140) opaque.push({ x, y });
    }
  }

  if (opaque.length === 0) return [];

  // Even coverage: walk the opaque pixels with a fractional stride rather than
  // picking at random, which would clump and leave holes in the letterforms.
  const targets: Array<{ x: number; y: number }> = [];
  const stride = opaque.length / count;
  const pixelWidth = markWidth / rasterWidth;
  const pixelHeight = markHeight / rasterHeight;

  for (let i = 0; i < count; i += 1) {
    const source = opaque[Math.floor(i * stride) % opaque.length];
    if (!source) continue;
    targets.push({
      x: markLeft + (source.x + random()) * pixelWidth,
      y: markTop + (source.y + random()) * pixelHeight,
    });
  }

  return targets;
}

/**
 * One 32px radial sprite per champagne tone, pre-rendered once and blitted for
 * every particle. The gradient work happens three times at start-up instead of
 * hundreds of times per frame.
 */
function createSprite(rgb: string): HTMLCanvasElement {
  const size = 32;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    // A pale hot core over a champagne body — how a lit metallic mote reads.
    gradient.addColorStop(0, `rgba(255,250,240,1)`);
    gradient.addColorStop(0.22, `rgba(${rgb},0.85)`);
    gradient.addColorStop(0.55, `rgba(${rgb},0.25)`);
    gradient.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return sprite;
}

export type ParticleFieldOptions = {
  canvas: HTMLCanvasElement;
  /** >1 compresses the whole timeline (used for the fast repeat-visit intro). */
  speed?: number;
  /** Fired whenever the field crosses into a new phase. */
  onPhase?: (phase: IntroPhase) => void;
  /**
   * Preloaded /brand/industry-insider-mark.svg. When present the particles form
   * this artwork; otherwise they form the built-in placeholder geometry.
   */
  markImage?: HTMLImageElement | null;
  /**
   * Where the crisp mark sits on screen, in CSS pixels relative to the canvas.
   *
   * Supplied by the caller by measuring the real logo element, so the dust
   * always settles exactly over the artwork it hands off to — whatever size,
   * aspect ratio or position the layout gives it. Returning null falls back to
   * a sensible centred box.
   */
  getMarkRect?: () => {
    left: number;
    top: number;
    width: number;
    height: number;
  } | null;
};

export type ParticleFieldHandle = {
  destroy: () => void;
};

export function createParticleField({
  canvas,
  speed = 1,
  onPhase,
  markImage = null,
  getMarkRect,
}: ParticleFieldOptions): ParticleFieldHandle {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return { destroy: () => {} };
  const ctx = context;

  const sprites = TONES.map((tone) => createSprite(tone));
  const random = createRandom(20240117);

  let particles: Particle[] = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let elapsed = 0;
  let lastFrame = 0;
  let frameId = 0;
  let running = true;
  let phase: IntroPhase = "drift";
  let convergeInitialised = false;

  function setPhase(next: IntroPhase) {
    if (next === phase) return;
    phase = next;
    onPhase?.(next);
  }

  function build() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));

    const isNarrow = width < 720;
    dpr = Math.min(window.devicePixelRatio || 1, isNarrow ? 1.5 : 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Density scales with viewport but is hard-capped at both ends.
    const count = isNarrow
      ? 110
      : Math.min(300, Math.round((width * height) / 6500));

    // Mark geometry: measured from the real logo element where possible, so the
    // dust settles precisely onto the artwork it hands off to.
    const measured = getMarkRect?.() ?? null;
    const fallbackWidth = Math.min(
      isNarrow ? width * 0.62 : width * 0.34,
      isNarrow ? 260 : 420,
    );
    const fallbackHeight =
      (fallbackWidth * MONOGRAM_VIEWBOX.height) / MONOGRAM_VIEWBOX.width;

    const markWidth = measured?.width || fallbackWidth;
    const markHeight = measured?.height || fallbackHeight;
    const markLeft = measured ? measured.left : (width - markWidth) / 2;
    const markTop = measured
      ? measured.top
      : height * 0.5 - markHeight * 0.5 - height * 0.06;

    const targets = sampleMonogramTargets(
      markLeft,
      markTop,
      markWidth,
      markHeight,
      count,
      random,
      markImage,
    );

    particles = targets.map((target, index) => {
      // Start scattered across the viewport, weighted away from dead centre so
      // the convergence reads as an inward gathering.
      const angle = random() * Math.PI * 2;
      const spread = 0.35 + random() * 0.75;
      const ox = width / 2 + Math.cos(angle) * (width * 0.58) * spread;
      const oy = height / 2 + Math.sin(angle) * (height * 0.58) * spread;

      return {
        x: ox,
        y: oy,
        tx: target.x,
        ty: target.y,
        fx: ox,
        fy: oy,
        ox,
        oy,
        ax: 12 + random() * 26,
        ay: 10 + random() * 22,
        sx: 0.12 + random() * 0.16,
        sy: 0.1 + random() * 0.14,
        phase: random() * Math.PI * 2,
        delay: random(),
        size: 0.7 + random() * 1.5,
        alpha: 0.3 + random() * 0.6,
        tone: index % TONES.length,
        twinkle: random() * Math.PI * 2,
      };
    });

    convergeInitialised = false;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    const t = elapsed;
    const driftUntil = INTRO_TIMELINE.driftUntil / speed;
    const convergeUntil = INTRO_TIMELINE.convergeUntil / speed;
    const revealAt = INTRO_TIMELINE.revealAt / speed;
    const wordmarkAt = INTRO_TIMELINE.wordmarkAt / speed;
    const completeAt = INTRO_TIMELINE.completeAt / speed;

    // Fade the whole field in, then out once the crisp mark has taken over.
    const fadeIn = clamp01(t / (320 / speed));
    const fadeOut = 1 - clamp01((t - revealAt) / (620 / speed));
    const fieldAlpha = fadeIn * fadeOut;

    if (t < driftUntil) setPhase("drift");
    else if (t < convergeUntil) setPhase("converge");
    else if (t < revealAt) setPhase("settle");
    else if (t < wordmarkAt) setPhase("reveal");
    else if (t < completeAt) setPhase("wordmark");
    else setPhase("complete");

    if (t >= driftUntil && !convergeInitialised) {
      // Freeze each particle's drift position as its convergence origin, so
      // nothing snaps at the hand-off.
      for (const p of particles) {
        p.fx = p.x;
        p.fy = p.y;
      }
      convergeInitialised = true;
    }

    const seconds = t / 1000;

    for (const p of particles) {
      if (t < driftUntil || !convergeInitialised) {
        // Slow, wide drift. Two out-of-phase sines read as air movement
        // rather than orbiting.
        p.x = p.ox + Math.sin(seconds * p.sx + p.phase) * p.ax;
        p.y = p.oy + Math.cos(seconds * p.sy + p.phase * 1.3) * p.ay;
      } else {
        const span = convergeUntil - driftUntil;
        const lead = span * 0.28;
        const start = driftUntil + p.delay * lead;
        const progress = clamp01((t - start) / (span - lead));
        const eased = easeInOutCubic(progress);

        // A slight curl on the way in: the dust arcs into place instead of
        // travelling on dead-straight lines.
        const curl = Math.sin(progress * Math.PI) * (1 - progress) * 26;
        const dx = p.tx - p.fx;
        const dy = p.ty - p.fy;
        const length = Math.hypot(dx, dy) || 1;

        p.x = p.fx + dx * eased + (-dy / length) * curl * (p.delay - 0.5);
        p.y = p.fy + dy * eased + (dx / length) * curl * (p.delay - 0.5);

        if (progress >= 1) {
          // Settled: a sub-pixel shimmer keeps the mark alive without wobble.
          const shimmer = Math.sin(seconds * 2.2 + p.twinkle) * 0.35;
          p.x = p.tx + shimmer;
          p.y = p.ty + shimmer * 0.6;
        }
      }

      // Particles brighten as they arrive — the "magnetised" tell.
      const arrival =
        t < driftUntil
          ? 0
          : clamp01((t - driftUntil) / Math.max(1, convergeUntil - driftUntil));
      const alpha = p.alpha * fieldAlpha * (0.55 + easeOutCubic(arrival) * 0.45);
      if (alpha <= 0.004) continue;

      const sprite = sprites[p.tone] ?? sprites[0];
      if (!sprite) continue;

      const size = p.size * (1 + arrival * 0.35);
      const diameter = size * 6;

      ctx.globalAlpha = alpha;
      ctx.drawImage(
        sprite,
        p.x - diameter / 2,
        p.y - diameter / 2,
        diameter,
        diameter,
      );
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function frame(now: number) {
    if (!running) return;
    const delta = lastFrame === 0 ? 16 : Math.min(now - lastFrame, 48);
    lastFrame = now;
    elapsed += delta;
    draw();
    frameId = window.requestAnimationFrame(frame);
  }

  function stop() {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
  }

  function start() {
    stop();
    lastFrame = 0;
    frameId = window.requestAnimationFrame(frame);
  }

  function handleVisibility() {
    if (document.hidden) {
      stop();
    } else if (running) {
      start();
    }
  }

  let resizeTimer = 0;
  function handleResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      build();
      draw();
    }, 150);
  }

  build();
  start();

  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("resize", handleResize);

  return {
    destroy() {
      running = false;
      stop();
      window.clearTimeout(resizeTimer);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
      ctx.clearRect(0, 0, width, height);
    },
  };
}
