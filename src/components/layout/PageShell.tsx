import Link from "next/link";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { brand } from "@/content/site";

/**
 * Shell for the secondary pages (privacy, terms, contact).
 *
 * Same palette and typography as the launch page, without the intro or the
 * fixed navigation — these are documents, and they should read like documents.
 */
export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-rule-soft">
        <div className="shell flex items-center justify-between py-6">
          <Link
            href="/"
            className="flex items-center gap-3 text-champagne-500 transition-colors duration-500 hover:text-champagne-300"
          >
            <BrandLogo
              variant="mark"
              width={200}
              height={120}
              priority
              className="h-5 w-auto"
            />
            <span className="font-display text-[0.8rem] uppercase tracking-[0.3em] text-ivory-50">
              {brand.wordmark}
            </span>
          </Link>

          <Link
            href="/"
            className="font-sans text-[0.68rem] font-medium uppercase tracking-[0.26em] text-muted transition-colors duration-500 hover:text-ivory-50"
          >
            Back
          </Link>
        </div>
      </header>

      <main id="main" className="shell py-20 md:py-28">
        <p className="u-label">{eyebrow}</p>
        <h1 className="mt-7 max-w-[18ch] font-display text-[clamp(2.3rem,1.7rem+2.8vw,3.8rem)] font-light leading-[1.05] tracking-[-0.01em] text-ivory-50">
          {title}
        </h1>

        {intro && (
          <p className="measure mt-8 text-[clamp(1rem,0.95rem+0.26vw,1.1rem)] font-light leading-[1.8] text-muted">
            {intro}
          </p>
        )}

        <div className="mt-14 max-w-[68ch] space-y-10">{children}</div>
      </main>

      <SiteFooter />
    </>
  );
}

/** A titled block of body copy, used by the secondary pages. */
export function DocSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-[clamp(1.3rem,1.15rem+0.7vw,1.7rem)] font-light leading-[1.25] text-ivory-50">
        {heading}
      </h2>
      <div className="mt-4 space-y-4 text-[0.98rem] font-light leading-[1.8] text-muted">
        {children}
      </div>
    </section>
  );
}
