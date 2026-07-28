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
 *
 * It is also lightly magnetic: motes near the cursor lean towards it and ease
 * back when it leaves. Deliberately weak and slow — the brief's image is fine
 * gold dust being drawn by a magnet, not particles snapping to a pointer, and
 * anything springier reads as a tech demo. Fine pointers only, so a touch
 * screen never gets a ghost cursor pulling at the cloud.
 */

const TONES = ["200,161,90", "216,185,120", "231,210,163"] as const;

/** ~30fps. */
const FRAME_MS = 33;

/** How far the cursor's pull reaches, in CSS pixels. */
const MAGNET_RADIUS = 260;
/** The furthest a mote will lean towards the cursor, in CSS pixels. */
const MAGNET_REACH = 26;
/**
 * Per-frame easing towards the target lean. Low enough that the cloud gathers
 * over roughly half a second and drifts back over about the same — the lag is
 * what makes it read as dust rather than as a cursor effect.
 */
const MAGNET_EASE = 0.06;

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
  /** Current lean towards the cursor, in CSS pixels. Eased, never jumped. */
  pullX: number;
  pullY: number;
  /** 0–1. Scales this mote's response, so the cloud does not move as a slab. */
  susceptibility: number;
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
  /**
   * Cursor position. Held in viewport coordinates and converted to canvas-local
   * once per frame inside draw(), rather than on every pointermove — the canvas
   * scrolls, so its box has to be re-read anyway, and one layout read per frame
   * is far cheaper than one per mouse event.
   */
  let pointerClientX = 0;
  let pointerClientY = 0;
  let pointerSeen = false;
  let pointerX = 0;
  let pointerY = 0;
  let pointerLive = false;
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
        pullX: 0,
        pullY: 0,
        // Lighter motes answer the magnet more readily than heavier ones. Giving
        // every mote the same response would slide the whole cloud sideways as
        // one piece, which looks like a moving image rather than moving dust.
        susceptibility: 0.35 + random() * 0.65,
      };
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    if (pointerSeen) {
      const box = canvas.getBoundingClientRect();
      pointerX = pointerClientX - box.left;
      pointerY = pointerClientY - box.top;
      // Keep pulling for one radius beyond the canvas so the cloud reacts as
      // the cursor approaches the hero, and releases smoothly as it leaves.
      pointerLive =
        pointerX > -MAGNET_RADIUS &&
        pointerY > -MAGNET_RADIUS &&
        pointerX < width + MAGNET_RADIUS &&
        pointerY < height + MAGNET_RADIUS;
    }

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
      const driftX = centreX + localX * cos - localY * sin;
      const driftY = centreY + localX * sin + localY * cos;

      // The magnet. Target lean is computed from where the mote would be
      // without any pull, so the attraction can never feed back on itself and
      // drag a mote away for good.
      let targetX = 0;
      let targetY = 0;
      if (pointerLive) {
        const dx = pointerX - driftX;
        const dy = pointerY - driftY;
        const distance = Math.hypot(dx, dy);
        if (distance < MAGNET_RADIUS && distance > 0.001) {
          // Squared falloff: strong close in, gone well before the edge, so
          // there is no visible boundary where the effect switches off.
          const falloff = 1 - distance / MAGNET_RADIUS;
          const strength = falloff * falloff * mote.susceptibility;
          targetX = (dx / distance) * MAGNET_REACH * strength;
          targetY = (dy / distance) * MAGNET_REACH * strength;
        }
      }
      mote.pullX += (targetX - mote.pullX) * MAGNET_EASE;
      mote.pullY += (targetY - mote.pullY) * MAGNET_EASE;

      const x = driftX + mote.pullX;
      const y = driftY + mote.pullY;

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

  // Magnetism, on a fine pointer only. A coarse pointer has no hover state, so
  // the pull would only ever fire on a tap — a stray tug with no cause on
  // screen. Better to leave the cloud drifting.
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const onPointerMove = (event: PointerEvent) => {
    pointerClientX = event.clientX;
    pointerClientY = event.clientY;
    pointerSeen = true;
  };
  const releasePointer = () => {
    pointerLive = false;
    pointerSeen = false;
  };
  if (finePointer) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", releasePointer);
    window.addEventListener("blur", releasePointer);
  }

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
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", releasePointer);
      window.removeEventListener("blur", releasePointer);
      ctx.clearRect(0, 0, width, height);
    },
  };
}
