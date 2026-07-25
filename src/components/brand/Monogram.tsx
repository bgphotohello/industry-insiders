import { MONOGRAM_SHAPES, MONOGRAM_VIEWBOX } from "@/lib/brand/monogram";

type MonogramProps = {
  className?: string;
  /**
   * Accessible name. Omit for decorative use, where the mark is hidden from
   * assistive technology because the text beside it already says the same
   * thing.
   */
  title?: string;
};

/**
 * The Industry Insider monogram, drawn inline.
 *
 * This is the always-available rendering: it needs no network request, cannot
 * 404, inherits `currentColor`, and is what the crisp reveal at the end of the
 * intro animates. `BrandLogo` prefers the files in /public/brand and falls back
 * to this component if they are missing.
 */
export function Monogram({ className, title }: MonogramProps) {
  const decorative = !title;

  return (
    <svg
      viewBox={`0 0 ${MONOGRAM_VIEWBOX.width} ${MONOGRAM_VIEWBOX.height}`}
      className={className}
      fill="currentColor"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={title}
      focusable="false"
    >
      {MONOGRAM_SHAPES.map((shape, index) => (
        <path
          key={index}
          d={shape.d}
          transform={`translate(${shape.x} ${shape.y}) scale(${shape.scale})`}
        />
      ))}
    </svg>
  );
}
