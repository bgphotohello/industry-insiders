/**
 * Industry Insider monogram geometry.
 *
 * A single source of truth for the mark, shared by:
 *   - the inline React SVG fallback (`components/brand/Monogram.tsx`)
 *   - the particle canvas, which rasterises these same paths to work out where
 *     each particle should come to rest (`components/intro/particle-field.ts`)
 *
 * The mark is two capital serif "I" characters set close together with a very
 * small silhouette of Texas centred between them — occupying roughly the space
 * a traditional monogram diamond would. The two stems stay far enough apart,
 * and the Texas mark stays small enough, that the pair always reads as two
 * separate letters rather than an "H".
 *
 * Coordinate space: 200 x 120 viewBox. Letters run from y=10 to y=110.
 *
 * NOTE: these paths are the *placeholder* artwork. When final vector files are
 * supplied they are dropped into /public/brand (see README) and the SVG files
 * take over automatically — this geometry then only backs the intro animation
 * and the offline fallback.
 */

export const MONOGRAM_VIEWBOX = { width: 200, height: 120 } as const;

/**
 * One high-contrast serif "I" in a local 44 x 100 box: thin flared serifs,
 * bracketed transitions, an 11-unit stem.
 */
const SERIF_I_GLYPH =
  "M0.5,0 H43.5 V5.4 H34.2 C29.9,5.4 27.6,9.1 27.6,14.6 V85.4 C27.6,90.9 29.9,94.6 34.2,94.6 H43.5 V100 H0.5 V94.6 H9.8 C14.1,94.6 16.4,90.9 16.4,85.4 V14.6 C16.4,9.1 14.1,5.4 9.8,5.4 H0.5 Z";

/**
 * Simplified silhouette of Texas in a local 100 x 100 box: panhandle, the Red
 * River border, the Sabine edge, the Gulf coast, and the Rio Grande running
 * back up to El Paso. Simplified deliberately — at final size it renders around
 * 16 x 18px, where extra vertices only muddy the shape.
 */
const TEXAS_GLYPH =
  "M27.5,0.0 L50.6,0.0 L50.6,18.1 L53.6,18.1 L56.7,19.6 L58.6,21.5 L62.7,21.9 L65.0,24.3 L70.0,24.3 L71.9,24.8 L74.1,26.6 L78.7,26.2 L84.4,24.3 L91.3,26.6 L95.9,27.6 L95.9,42.2 L97.3,49.5 L98.3,55.6 L97.3,63.6 L90.9,66.8 L86.3,71.0 L77.9,75.2 L73.0,80.8 L71.1,86.9 L71.9,92.5 L70.7,98.6 L63.5,97.7 L57.4,94.4 L54.4,83.6 L48.3,76.6 L43.0,67.3 L33.1,62.1 L28.5,68.2 L25.5,70.1 L19.4,66.4 L14.8,58.9 L8.0,52.3 L1.1,44.4 L0.2,43.0 L27.5,42.1 Z";

type Placement = {
  d: string;
  /** translate + scale applied to the glyph's local box */
  x: number;
  y: number;
  scale: number;
};

/**
 * The three shapes that make up the mark, positioned in the 200 x 120 viewBox.
 *
 * Left serif spans x 24 → 68, right serif spans x 132 → 176; the Texas mark is
 * centred at x=100 at ~16 units wide, leaving clear air on both sides.
 */
export const MONOGRAM_SHAPES: Placement[] = [
  { d: SERIF_I_GLYPH, x: 24, y: 10, scale: 1 },
  { d: SERIF_I_GLYPH, x: 132, y: 10, scale: 1 },
  // 16 x 16 Texas, vertically centred on the letters' optical middle.
  { d: TEXAS_GLYPH, x: 92, y: 52, scale: 0.16 },
];

/** Texas on its own, in a 100 x 100 viewBox — used as a standalone accent. */
export const TEXAS_PATH = TEXAS_GLYPH;
export const TEXAS_VIEWBOX = { width: 100, height: 100 } as const;

/** Transform string for a placement, for use as an SVG `transform` attribute. */
export function placementTransform(p: Placement): string {
  return `translate(${p.x} ${p.y}) scale(${p.scale})`;
}
