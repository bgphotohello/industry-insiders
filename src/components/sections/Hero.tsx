"use client";

import { motion } from "motion/react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { HeroDust } from "@/components/hero/HeroDust";
import { useIntroFinished } from "@/components/intro/IntroProvider";
import { CtaLink } from "@/components/ui/CtaLink";
import { DiamondRule, FlankedLabel } from "@/components/ui/DiamondRule";
import { brand, hero, heroHeadingText } from "@/content/site";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

/**
 * The hero — a centred lockup, per the approved design comp.
 *
 * Gold does the hierarchy here: the mark, the display wordmark, the tagline
 * and the closing phrase of the headline all carry champagne, while the body
 * copy stays cool and quiet. No photography; the atmosphere is the dust cloud
 * and the type.
 *
 * Content is in the markup from first paint. Only the entrance animation waits
 * for the intro, so nothing is gated behind motion and the intro causes no
 * layout shift.
 */
export function Hero() {
  const introFinished = useIntroFinished();
  const prefersReducedMotion = usePrefersReducedMotion();

  const rise = (delay: number) =>
    prefersReducedMotion
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 14 },
          animate: introFinished
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 14 },
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
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-14 pt-20 md:pb-16 md:pt-24"
    >
      {/* Atmosphere is the page-level AmbientGlow, which starts here and travels
          down as you scroll; the hero adds only the dust. */}
      <HeroDust />

      <div className="shell relative flex w-full flex-col items-center text-center">
        {/* --- The lockup ---------------------------------------------- */}
        <motion.div
          className="text-champagne-500"
          {...rise(0.02)}
        >
          <BrandLogo
            variant="mark"
            width={200}
            height={120}
            priority
            className="h-auto w-[clamp(5.5rem,3.6rem+5.4vw,8.75rem)]"
          />
        </motion.div>

        <motion.p
          className="mt-6 font-display text-[clamp(1.65rem,1rem+2.9vw,3.35rem)] font-light uppercase leading-[1.16] text-metal md:mt-7"
          // Tracking this wide leaves a trailing space after the last letter;
          // the negative margin pulls the optical centre back to true centre.
          style={{ letterSpacing: "0.34em", marginRight: "-0.34em" }}
          {...rise(0.1)}
        >
          <span className="block">{brand.wordmarkLines[0]}</span>
          <span className="block">
            {brand.wordmarkLines[1]}
            {brand.trademark && (
              <span className="align-super text-[0.26em] tracking-normal">
                {brand.trademark}
              </span>
            )}
          </span>
        </motion.p>

        <motion.div
          className="mt-6 w-full max-w-sm md:mt-7"
          {...rise(0.18)}
        >
          <DiamondRule />
        </motion.div>

        <motion.p
          className="mt-5 font-sans text-[clamp(0.64rem,0.6rem+0.22vw,0.76rem)] font-medium uppercase tracking-[0.3em] text-champagne-400/90"
          {...rise(0.24)}
        >
          {brand.tagline}
          {brand.trademark && (
            <span className="align-super text-[0.62em] tracking-normal">
              {brand.trademark}
            </span>
          )}
        </motion.p>

        {/* --- The proposition ----------------------------------------- */}
        <motion.div className="mt-10 md:mt-12" {...rise(0.32)}>
          <FlankedLabel>{hero.eyebrow}</FlankedLabel>
        </motion.div>

        <motion.h1
          id="hero-heading"
          className="mt-6 max-w-[16ch] font-display text-[clamp(2.2rem,1.45rem+3.1vw,4.2rem)] font-light leading-[1.06] tracking-[-0.012em] text-ivory-50"
          // The heading is split for typographic emphasis; this keeps it as one
          // readable sentence for assistive technology and search.
          aria-label={heroHeadingText}
          {...rise(0.38)}
        >
          <span aria-hidden className="block">
            {hero.heading.line1}
          </span>
          <span aria-hidden className="block italic">
            {hero.heading.line2}{" "}
            <span className="text-champagne-400">{hero.heading.line2Accent}</span>
          </span>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-[68ch] text-[clamp(0.95rem,0.9rem+0.24vw,1.05rem)] font-light leading-[1.7] text-muted"
          {...rise(0.44)}
        >
          {hero.body}
        </motion.p>

        <motion.p
          className="mt-4 max-w-[66ch] text-[clamp(0.88rem,0.85rem+0.16vw,0.95rem)] font-light leading-[1.6] text-faint"
          {...rise(0.5)}
        >
          {hero.secondary}
        </motion.p>

        <motion.div className="mt-8 md:mt-9" {...rise(0.56)}>
          <CtaLink href={hero.primaryCta.href}>{hero.primaryCta.label}</CtaLink>
        </motion.div>

        <motion.a
          href={hero.secondaryCta.href}
          className="group mt-6 inline-flex items-center gap-3 font-sans text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted transition-colors duration-500 hover:text-champagne-300"
          {...rise(0.62)}
        >
          {hero.secondaryCta.label}
          {/* The scroll cue. A slow 3px drift — enough to read as an
              invitation to scroll, nowhere near a bounce. */}
          <motion.span
            aria-hidden
            className="block"
            animate={prefersReducedMotion ? undefined : { y: [0, 3, 0] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: [0.65, 0, 0.35, 1],
            }}
          >
            ↓
          </motion.span>
        </motion.a>
      </div>
    </section>
  );
}
