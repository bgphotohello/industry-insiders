import { TEXAS_PATH, TEXAS_VIEWBOX } from "@/lib/brand/monogram";

/**
 * The Texas silhouette on its own, used as a small punctuation accent — in the
 * confirmation state and between footer rules. Always decorative: it never
 * carries information that is not also written out.
 */
export function TexasMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${TEXAS_VIEWBOX.width} ${TEXAS_VIEWBOX.height}`}
      className={className}
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d={TEXAS_PATH} />
    </svg>
  );
}
