import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { coming } from "@/content/site";

/**
 * What is coming.
 *
 * The comp's four-up band: an oversized champagne numeral, a champagne
 * uppercase label and a short centred description, divided by vertical
 * hairlines rather than boxed into cards.
 *
 * Deliberately typographic. These are previews of a platform that does not
 * exist yet, so there are no mocked dashboards, no device frames and no
 * screenshots — presenting an unbuilt product as built would be a lie the
 * brand cannot afford.
 */
export function WhatIsComing() {
  return (
    <section
      id={coming.id}
      aria-labelledby="coming-heading"
      className="relative border-t border-rule-soft bg-navy-900/55 py-20 md:py-28"
    >
      <div className="shell">
        <div className="flex flex-col items-center text-center">
          <Reveal>
            <MicroLabel variant="plain">{coming.label}</MicroLabel>
          </Reveal>

          <MaskedHeading
            as="h2"
            id="coming-heading"
            className="mt-7 max-w-[20ch] font-display text-[clamp(1.9rem,1.4rem+2.2vw,3.2rem)] font-light leading-[1.1] tracking-[-0.01em] text-ivory-50"
          >
            {coming.heading}
          </MaskedHeading>
        </div>

        <ul className="mt-14 grid gap-y-12 md:mt-20 md:grid-cols-2 lg:grid-cols-4 lg:gap-y-0">
          {coming.features.map((feature, index) => (
            <Reveal
              as="li"
              key={feature.index}
              delay={index * 0.07}
              className="flex flex-col items-center px-4 text-center lg:border-l lg:border-rule-soft lg:first:border-l-0 lg:px-8"
            >
              <p
                aria-hidden
                className="numerals-lining font-display text-[clamp(1.9rem,1.5rem+1.2vw,2.6rem)] font-light leading-none text-champagne-400"
              >
                {feature.index}
              </p>

              <h3 className="mt-5 font-sans text-[0.7rem] font-medium uppercase tracking-[0.24em] text-champagne-500">
                {feature.title}
              </h3>

              <p className="mt-5 max-w-[34ch] text-[0.92rem] font-light leading-[1.75] text-muted">
                {feature.copy}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
