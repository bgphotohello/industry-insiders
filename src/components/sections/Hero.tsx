"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

import { useIntroFinished } from "@/components/intro/IntroProvider";
import { CtaLink } from "@/components/ui/CtaLink";
import { hero } from "@/content/site";

/**
 * The hero.
 *
 * No photography by design — the atmosphere comes from a single soft navy
 * lift, two hairlines, and the type itself. Content is present in the markup
 * from first paint; only the entrance waits for the intro to finish, so
 * nothing is gated behind animation and the intro causes no layout shift.
 */
export function Hero() {
  const introFinished = useIntroFinished();
  const prefersReducedMotion = usePrefersReducedMotion();

  const rise = (delay: number) =>
    prefersReducedMotion
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 16 },
          animate: introFinished
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 16 },
          transition: {
            duration: 1,
            delay: introFinished ? delay : 0,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-24 pt-28 md:pb-32 md:pt-32"
    >
      {/* Atmosphere: one restrained radial lift and a pair of hairlines. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 80% at 50% 30%, rgba(16,38,66,0.72) 0%, rgba(6,20,38,0) 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-[8%] hidden w-px bg-gradient-to-b from-transparent via-champagne-500/12 to-transparent lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-[8%] hidden w-px bg-gradient-to-b from-transparent via-champagne-500/12 to-transparent lg:block"
      />

      <div className="shell relative w-full">
        <motion.p
          className="u-label"
          {...rise(0.05)}
        >
          {hero.eyebrow}
        </motion.p>

        <motion.h1
          id="hero-heading"
          className="mt-8 max-w-[19ch] font-display text-[clamp(2.9rem,1.8rem+4.6vw,6.25rem)] font-light leading-[0.98] tracking-[-0.015em] text-ivory-50"
          {...rise(0.16)}
        >
          {hero.heading}
        </motion.h1>

        <motion.div className="mt-10 max-w-xl" {...rise(0.28)}>
          <p className="measure text-[clamp(1rem,0.95rem+0.28vw,1.14rem)] font-light leading-[1.75] text-muted">
            {hero.body}
          </p>
          <p className="measure mt-6 text-[clamp(0.94rem,0.9rem+0.2vw,1.02rem)] font-light leading-[1.7] text-faint">
            {hero.secondary}
          </p>
        </motion.div>

        <motion.div
          className="mt-14 flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-12"
          {...rise(0.4)}
        >
          <CtaLink href={hero.primaryCta.href}>{hero.primaryCta.label}</CtaLink>
          <CtaLink href={hero.secondaryCta.href} variant="secondary">
            {hero.secondaryCta.label}
          </CtaLink>
        </motion.div>
      </div>

      <ScrollIndicator visible={introFinished} />
    </section>
  );
}

/**
 * A hairline that fills downward on a slow loop. Decorative and label-free in
 * the accessibility tree — the same affordance exists as the "Discover the
 * vision" link above.
 */
function ScrollIndicator({ visible }: { visible: boolean }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      aria-hidden
      className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 1.2, delay: visible ? 0.8 : 0 }}
    >
      <span className="font-sans text-[0.6rem] uppercase tracking-[0.32em] text-faint">
        {hero.scrollHint}
      </span>
      <span className="relative block h-12 w-px overflow-hidden bg-ivory-100/12">
        {prefersReducedMotion ? (
          <span className="absolute inset-x-0 top-0 block h-4 bg-champagne-500/70" />
        ) : (
          <motion.span
            className="absolute inset-x-0 top-0 block h-4 bg-champagne-500/70"
            animate={{ y: ["-100%", "300%"] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: [0.65, 0, 0.35, 1],
              repeatDelay: 0.5,
            }}
          />
        )}
      </span>
    </motion.div>
  );
}
