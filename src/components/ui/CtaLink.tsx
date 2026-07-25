import type { AnchorHTMLAttributes } from "react";

type CtaLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "primary" | "secondary";
};

/**
 * The site's two call-to-action treatments.
 *
 * primary   — a thin champagne frame that warms on hover. No fill sweep, no
 *             scale, no magnetism: the movement is a 1px settle of the label.
 * secondary — a tracked label over a hairline that extends on hover.
 *
 * Both are real anchors, so they work with keyboard, middle-click and
 * screen readers, and both keep the global focus ring.
 */
export function CtaLink({
  variant = "primary",
  className,
  children,
  ...props
}: CtaLinkProps) {
  if (variant === "secondary") {
    return (
      <a
        {...props}
        className={`group inline-flex flex-col items-start gap-2 text-[0.72rem] font-medium uppercase tracking-[0.28em] text-ivory-100 transition-colors duration-500 hover:text-champagne-300 ${className ?? ""}`}
      >
        <span>{children}</span>
        <span
          aria-hidden
          className="h-px w-full max-w-[7.5rem] origin-left bg-champagne-500/45 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-[1.18] group-hover:bg-champagne-400/80"
        />
      </a>
    );
  }

  return (
    <a
      {...props}
      className={`group relative inline-flex items-center justify-center border border-champagne-500/45 px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.28em] text-ivory-50 transition-[border-color,background-color] duration-500 hover:border-champagne-400/90 hover:bg-champagne-500/[0.07] md:px-10 ${className ?? ""}`}
    >
      <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-px">
        {children}
      </span>
    </a>
  );
}
