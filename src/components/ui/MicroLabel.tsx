/**
 * Uppercase, widely tracked section label in champagne.
 *
 * Three treatments, all from the design comp:
 *   "rule"      a short champagne rule to the left  (editorial sections)
 *   "underline" the rule sits beneath the label     (stacked panels)
 *   "plain"     label only                          (tight columns)
 *
 * The rule is always decorative; the text is real text, so section labels stay
 * announced and searchable.
 */
export function MicroLabel({
  children,
  className,
  variant = "rule",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "rule" | "underline" | "plain";
}) {
  if (variant === "underline") {
    return (
      <p className={className}>
        <span className="u-label block">{children}</span>
        <span
          aria-hidden
          className="mt-3 block h-px w-full max-w-[9rem] bg-gradient-to-r from-champagne-500/70 to-champagne-500/10"
        />
      </p>
    );
  }

  if (variant === "plain") {
    return <p className={`u-label ${className ?? ""}`}>{children}</p>;
  }

  return (
    <p className={`flex items-center gap-4 ${className ?? ""}`}>
      <span
        aria-hidden
        className="h-px w-8 shrink-0 bg-champagne-500/60 md:w-12"
      />
      <span className="u-label">{children}</span>
    </p>
  );
}
