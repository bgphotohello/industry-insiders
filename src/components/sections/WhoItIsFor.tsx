import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { SectionBackdrop } from "@/components/ui/SectionBackdrop";
import { community } from "@/content/site";

/**
 * The community.
 *
 * A quiet two-column editorial: statement on the left, the audience set as a
 * rule-divided list on the right. Each row is marked with a hairline rather
 * than a bullet or an icon.
 */
export function WhoItIsFor() {
  return (
    <section
      id={community.id}
      aria-labelledby="community-heading"
      className="relative overflow-hidden border-t border-rule-soft py-24 md:py-36 lg:py-44"
    >
      {/* Atmosphere for the audience description — a warm room, sunk almost to
          navy. It is not a photograph of an Industry Insider evening and is
          never presented as one; it is texture behind the type. */}
      <SectionBackdrop
        src="gathering"
        opacity={0.42}
        mobileOpacity={0.28}
        position="50% 42%"
      />

      <div className="shell relative grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <MicroLabel>{community.label}</MicroLabel>
          </Reveal>

          <MaskedHeading
            as="h2"
            id="community-heading"
            className="mt-8 max-w-[15ch] font-display text-[clamp(2.1rem,1.5rem+2.6vw,3.9rem)] font-light leading-[1.06] tracking-[-0.01em] text-ivory-50"
          >
            {community.heading}
          </MaskedHeading>

          <Reveal delay={0.12}>
            <p className="measure mt-8 text-[clamp(1rem,0.95rem+0.26vw,1.12rem)] font-light leading-[1.8] text-muted">
              {community.body}
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <ul className="border-t border-rule-soft">
            {community.audience.map((entry, index) => (
              <Reveal
                as="li"
                key={entry}
                delay={index * 0.06}
                className="flex items-baseline gap-5 border-b border-rule-soft py-5 md:gap-7 md:py-6"
              >
                <span
                  aria-hidden
                  className="mt-2 h-px w-5 shrink-0 bg-champagne-500/50 md:w-7"
                />
                <span className="text-[clamp(0.98rem,0.94rem+0.22vw,1.08rem)] font-light leading-[1.6] text-ivory-100">
                  {entry}
                </span>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.1}>
            <p className="mt-10 font-display text-[clamp(1.05rem,1rem+0.4vw,1.3rem)] font-light italic leading-[1.6] text-champagne-300/85">
              {community.note}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
