/**
 * A hairline with a small champagne diamond set into it — the divider used
 * throughout the design comp, beneath the navigation and between the wordmark
 * and the tagline.
 *
 * The diamond is a rotated square rather than an icon file: one element, no
 * request, and it scales with the rule.
 */
export function DiamondRule({
  className,
  width = "100%",
}: {
  className?: string;
  width?: string;
}) {
  return (
    <span
      aria-hidden
      className={`flex items-center justify-center gap-3 ${className ?? ""}`}
      style={{ width }}
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-champagne-500/45" />
      <span className="size-[5px] rotate-45 bg-champagne-500/85" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-champagne-500/45" />
    </span>
  );
}

/**
 * A label flanked by two short rules, centred — the comp's treatment for
 * "BY PERSONAL INVITATION".
 */
export function FlankedLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`flex items-center justify-center gap-5 ${className ?? ""}`}>
      <span
        aria-hidden
        className="h-px w-10 bg-gradient-to-r from-transparent to-champagne-500/55 md:w-16"
      />
      <span className="u-label whitespace-nowrap">{children}</span>
      <span
        aria-hidden
        className="h-px w-10 bg-gradient-to-l from-transparent to-champagne-500/55 md:w-16"
      />
    </p>
  );
}
