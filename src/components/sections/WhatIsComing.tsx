import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { RuleLine } from "@/components/motion/RuleLine";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { coming } from "@/content/site";

/**
 * What is coming.
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
      className="relative border-t border-rule-soft py-24 md:py-36 lg:py-44"
    >
      <div className="shell">
        <div className="max-w-3xl">
          <Reveal>
            <MicroLabel>{coming.label}</MicroLabel>
          </Reveal>

          <MaskedHeading
            as="h2"
            id="coming-heading"
            className="mt-8 max-w-[18ch] font-display text-[clamp(2.1rem,1.5rem+2.6vw,3.9rem)] font-light leading-[1.06] tracking-[-0.01em] text-ivory-50"
          >
            {coming.heading}
          </MaskedHeading>
        </div>

        <div className="mt-16 md:mt-24">
          {coming.features.map((feature, index) => (
            <div key={feature.index}>
              <RuleLine delay={index * 0.04} />
              <Reveal
                className="group grid gap-4 py-9 md:grid-cols-12 md:gap-8 md:py-12"
                delay={0.05}
              >
                <p
                  aria-hidden
                  className="u-label md:col-span-2 md:pt-2"
                >
                  {feature.index}
                </p>
                <h3 className="font-display text-[clamp(1.5rem,1.2rem+1.1vw,2.2rem)] font-light leading-[1.15] text-ivory-50 md:col-span-5">
                  {feature.title}
                </h3>
                <p className="measure text-[0.98rem] font-light leading-[1.8] text-muted md:col-span-5">
                  {feature.copy}
                </p>
              </Reveal>
            </div>
          ))}
          <RuleLine />
        </div>
      </div>
    </section>
  );
}
