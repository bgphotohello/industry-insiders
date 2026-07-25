/**
 * The ambient gold dust that sits behind the hero.
 *
 * A slow, sparse nebula drifting on a diagonal — the same fine champagne dust
 * the intro assembles from, left hanging in the air once it disperses.
 *
 * This one runs for as long as the hero is on screen, so it is built to be
 * cheap rather than impressive:
 *   - one canvas, three pre-rendered sprites, `lighter` compositing
 *   - throttled to ~30fps; the drift is far too slow for 60 to be visible
 *   - paused when the tab is hidden AND when the hero scrolls out of view
 *   - device pixel ratio capped, particle count scaled to the viewport
 *   - with prefers-reduced-motion it paints a single still frame and stops
 */

const TONES = ["200,161,90", "216,185,120", "231,210,163"] as const;

/** ~30fps. */
const FRAME_MS = 33;

type Mote = {
  /** Position within the cloud's local (unrotated) ellipse space, -1 … 1. */
  u: number;
  v: number;
  drift: number;
  wobble: number;
  phase: number;
  size: number;
  alpha: number;
  tone: number;
};

function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createSprite(rgb: string): HTMLCanvasElement {
  const size = 32;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255,250,240,1)");
    gradient.addColorStop(0.22, `rgba(${rgb},0.8)`);
    gradient.addColorStop(0.55, `rgba(${rgb},0.22)`);
    gradient.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return sprite;
}

export type HeroDustHandle = { destroy: () => void };

export function createHeroDust(
  canvas: HTMLCanvasElement,
  options: { reducedMotion?: boolean } = {},
): HeroDustHandle {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return { destroy: () => {} };
  const ctx = context;

  const sprites = TONES.map((tone) => createSprite(tone));
  const random = createRandom(730114);

  let motes: Mote[] = [];
  let width = 0;
  let height = 0;
  let frameId = 0;
  let lastPaint = 0;
  let elapsed = 0;
  let lastFrame = 0;
  let onScreen = true;
  let destroyed = false;
  /** Global brightness trim; the cloud sits behind the type on small screens. */
  let alphaScale = 1;

  // Cloud geometry, in fractions of the canvas box.
  let centreX = 0;
  let centreY = 0;
  let radiusLong = 0;
  let radiusShort = 0;
  const angle = (-34 * Math.PI) / 180;

  function build() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));

    const isNarrow = width < 900;
    const dpr = Math.min(window.devicePixelRatio || 1, isNarrow ? 1.5 : 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // On wide screens the cloud sits in the left third, clear of the centred
    // lockup. On narrow screens it drops behind the whole hero at low density,
    // where there is no room beside the type.
    centreX = isNarrow ? width * 0.5 : width * 0.22;
    centreY = isNarrow ? height * 0.34 : height * 0.52;
    radiusLong = isNarrow ? width * 0.7 : width * 0.4;
    radiusShort = isNarrow ? height * 0.28 : width * 0.235;

    // On narrow screens the cloud has nowhere to go but behind the lockup, so
    // it is dimmed to a shimmer rather than competing with gold type.
    alphaScale = isNarrow ? 0.5 : 1;

    const count = isNarrow ? 120 : Math.min(520, Math.round(width * 0.34));

    motes = Array.from({ length: count }, (_, index) => {
      // sqrt() keeps the density even across the disc; the extra power pulls a
      // dense core into the middle with a thinning halo, as in the comp.
      const radius = Math.pow(random(), 2.4);
      const theta = random() * Math.PI * 2;
      return {
        u: Math.cos(theta) * radius,
        v: Math.sin(theta) * radius,
        drift: 0.006 + random() * 0.02,
        wobble: 0.5 + random() * 1.6,
        phase: random() * Math.PI * 2,
        size: 0.45 + random() * 1.15,
        alpha: (0.26 + random() * 0.74) * (1 - radius * 0.62),
        tone: index % TONES.length,
      };
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    const seconds = elapsed / 1000;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    for (const mote of motes) {
      // Slide along the long axis and wrap, so the cloud is always moving but
      // never drains.
      let u = mote.u + seconds * mote.drift;
      u = ((u + 1) % 2) - 1;
      const v = mote.v + Math.sin(seconds * 0.12 + mote.phase) * 0.03 * mote.wobble;

      const localX = u * radiusLong;
      const localY = v * radiusShort;
      const x = centreX + localX * cos - localY * sin;
      const y = centreY + localX * sin + localY * cos;

      // Fade at the wrap seam so nothing pops in or out.
      const edge = Math.min(1, (1 - Math.abs(u)) * 4);
      const twinkle = 0.78 + Math.sin(seconds * 0.5 + mote.phase * 2) * 0.22;
      const alpha = mote.alpha * edge * twinkle * alphaScale;
      if (alpha <= 0.004) continue;

      const sprite = sprites[mote.tone] ?? sprites[0];
      if (!sprite) continue;

      const diameter = mote.size * 6;
      ctx.globalAlpha = alpha;
      ctx.drawImage(
        sprite,
        x - diameter / 2,
        y - diameter / 2,
        diameter,
        diameter,
      );
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function frame(now: number) {
    if (destroyed) return;
    frameId = window.requestAnimationFrame(frame);
    if (now - lastPaint < FRAME_MS) return;

    const delta = lastFrame === 0 ? FRAME_MS : Math.min(now - lastFrame, 100);
    lastFrame = now;
    lastPaint = now;
    elapsed += delta;
    draw();
  }

  function stop() {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrame = 0;
  }

  function start() {
    if (destroyed || frameId) return;
    frameId = window.requestAnimationFrame(frame);
  }

  function sync() {
    if (onScreen && !document.hidden) start();
    else stop();
  }

  build();

  if (options.reducedMotion) {
    // One still frame: the atmosphere is preserved, the movement is not.
    draw();
    return {
      destroy() {
        destroyed = true;
        ctx.clearRect(0, 0, width, height);
      },
    };
  }

  start();

  const observer = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      sync();
    },
    { threshold: 0 },
  );
  observer.observe(canvas);

  const onVisibility = () => sync();
  document.addEventListener("visibilitychange", onVisibility);

  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      build();
      draw();
    }, 160);
  };
  window.addEventListener("resize", onResize);

  return {
    destroy() {
      destroyed = true;
      stop();
      window.clearTimeout(resizeTimer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      ctx.clearRect(0, 0, width, height);
    },
  };
}
