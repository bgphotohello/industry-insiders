/**
 * Uppercase, widely tracked section label preceded by a short champagne rule.
 *
 * The rule is decorative; the text is real text, so section labels are
 * announced and searchable.
 */
export function MicroLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
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
