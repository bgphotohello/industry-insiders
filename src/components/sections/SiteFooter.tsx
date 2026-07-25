import { BrandLogo } from "@/components/brand/BrandLogo";
import { brand, footer } from "@/content/site";

/**
 * Footer.
 *
 * No social icons: none are shown until real accounts exist, because a linked
 * icon that goes nowhere is worse than no icon at all.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-rule-soft py-16 md:py-20">
      <div className="shell">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-4 text-champagne-500">
              <BrandLogo
                variant="mark"
                width={200}
                height={120}
                className="h-6 w-auto"
              />
              <span className="font-display text-[0.95rem] uppercase tracking-[0.32em] text-ivory-50">
                {brand.wordmark}
              </span>
            </div>
            <p className="mt-6 font-display text-[clamp(1.05rem,1rem+0.4vw,1.3rem)] font-light italic text-champagne-300/80">
              {brand.tagline}
            </p>
            <p className="mt-4 font-sans text-[0.72rem] uppercase tracking-[0.24em] text-faint">
              {brand.location}
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-10 gap-y-4">
              {footer.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-sans text-[0.78rem] font-light text-muted transition-colors duration-500 hover:text-champagne-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-rule-soft pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-[0.74rem] font-light text-faint">
            © {year} {brand.name}. All rights reserved.
          </p>
          <p className="font-sans text-[0.7rem] uppercase tracking-[0.24em] text-faint">
            By personal invitation
          </p>
        </div>
      </div>
    </footer>
  );
}
