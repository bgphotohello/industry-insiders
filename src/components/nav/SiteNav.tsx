"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { useCallback, useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { useIntroFinished } from "@/components/intro/IntroProvider";
import { DiamondRule } from "@/components/ui/DiamondRule";
import { brand, nav } from "@/content/site";

/**
 * Minimal fixed navigation.
 *
 * Appears only once the intro has finished, gains a faint backing once the
 * page has scrolled, and collapses on small screens into a full-screen panel
 * — a quiet cross-fade rather than an animated hamburger.
 */
export function SiteNav() {
  const introFinished = useIntroFinished();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Escape closes the panel; focus is kept inside it while open.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    // Move focus into the panel so the first Tab lands where the user expects.
    panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen, closeMenu]);

  const visible = introFinished;

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -12 }}
        animate={
          visible
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: prefersReducedMotion ? 0 : -12 }
        }
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        // Hidden from assistive tech and removed from the tab order until it is
        // actually on screen — an invisible nav must not be focusable.
        aria-hidden={visible ? undefined : true}
        inert={!visible}
      >
        <div
          className={`transition-colors duration-700 ${
            scrolled
              ? "border-b border-rule-soft bg-navy-950/85 backdrop-blur-[6px]"
              : "border-b border-transparent"
          }`}
        >
          <nav
            aria-label="Primary"
            className="shell flex items-center justify-between py-4 md:py-5"
          >
            <a
              href="#top"
              className="flex items-center gap-3 text-champagne-500 transition-colors duration-500 hover:text-champagne-300"
            >
              <BrandLogo
                variant="mark"
                width={200}
                height={120}
                priority
                className="h-7 w-auto md:h-8"
              />
              <span className="sr-only">{brand.name} — back to top</span>
              <span
                aria-hidden
                className="hidden font-display text-[0.72rem] font-light uppercase leading-[1.35] tracking-[0.3em] text-ivory-50 sm:block md:text-[0.78rem]"
              >
                <span className="block">{brand.wordmarkLines[0]}</span>
                <span className="block">
                  {brand.wordmarkLines[1]}
                  {brand.trademark && (
                    <span className="align-super text-[0.6em] tracking-normal text-champagne-400">
                      {brand.trademark}
                    </span>
                  )}
                </span>
              </span>
            </a>

            <div className="hidden items-center gap-10 lg:flex">
              <ul className="flex items-center gap-9">
                {nav.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="group relative block py-1 font-sans text-[0.68rem] font-medium uppercase tracking-[0.26em] text-muted transition-colors duration-500 hover:text-ivory-50"
                    >
                      {link.label}
                      <span
                        aria-hidden
                        className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-champagne-500/70 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                      />
                    </a>
                  </li>
                ))}
              </ul>

              <a
                href={nav.cta.href}
                className="border border-champagne-500/45 px-6 py-3 font-sans text-[0.66rem] font-medium uppercase tracking-[0.26em] text-ivory-50 transition-[border-color,background-color] duration-500 hover:border-champagne-400/90 hover:bg-champagne-500/[0.07]"
              >
                {nav.cta.label}
              </a>
            </div>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              className="font-sans text-[0.66rem] font-medium uppercase tracking-[0.26em] text-muted transition-colors duration-500 hover:text-ivory-50 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              Menu
            </button>
          </nav>

          {/* The comp's signature divider: a hairline with a diamond set into
              its centre, sitting directly beneath the bar. */}
          <DiamondRule className="opacity-70" />
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            // Fully opaque, not 98%: against a near-black panel even 2% of
            // bleed-through from large ivory display type stays visible.
            className="fixed inset-0 z-[70] flex flex-col bg-navy-950 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="shell flex items-center justify-between py-4">
              <BrandLogo
                variant="mark"
                width={200}
                height={120}
                className="h-5 w-auto text-champagne-500"
              />
              <button
                type="button"
                onClick={closeMenu}
                className="font-sans text-[0.66rem] font-medium uppercase tracking-[0.26em] text-muted transition-colors duration-500 hover:text-ivory-50"
              >
                Close
              </button>
            </div>

            <nav
              aria-label="Site"
              className="shell flex flex-1 flex-col justify-center gap-2 pb-24"
            >
              {nav.links.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="border-b border-rule-soft py-6 font-display text-[2rem] font-light tracking-[0.02em] text-ivory-50"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: prefersReducedMotion ? 0 : 0.06 + index * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {link.label}
                </motion.a>
              ))}

              <a
                href={nav.cta.href}
                onClick={closeMenu}
                className="mt-10 border border-champagne-500/45 px-6 py-4 text-center font-sans text-[0.7rem] font-medium uppercase tracking-[0.26em] text-ivory-50"
              >
                {nav.cta.label}
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
