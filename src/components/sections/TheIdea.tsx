import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { RuleLine } from "@/components/motion/RuleLine";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { idea } from "@/content/site";

/**
 * The vision.
 *
 * The three principles are set as an editorial sequence — oversized numerals,
 * a hairline per row, generous air — rather than icon cards.
 */
export function TheIdea() {
  return (
    <section
      id={idea.id}
      aria-labelledby="idea-heading"
      className="relative border-t border-rule-soft py-24 md:py-36 lg:py-44"
    >
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <MicroLabel>{idea.label}</MicroLabel>
            </Reveal>
            <MaskedHeading
              as="h2"
              id="idea-heading"
              className="mt-8 max-w-[14ch] font-display text-[clamp(2.1rem,1.5rem+2.6vw,3.9rem)] font-light leading-[1.06] tracking-[-0.01em] text-ivory-50"
            >
              {idea.heading}
            </MaskedHeading>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:pt-4">
            <Reveal delay={0.1}>
              <p className="measure text-[clamp(1rem,0.95rem+0.26vw,1.12rem)] font-light leading-[1.8] text-muted">
                {idea.body}
              </p>
            </Reveal>
          </div>
        </div>

        <ol className="mt-20 md:mt-28">
          {idea.principles.map((principle, index) => (
            <li key={principle.index}>
              <RuleLine delay={index * 0.05} />
              <Reveal
                className="grid gap-6 py-10 md:grid-cols-12 md:gap-8 md:py-14"
                delay={0.06}
              >
                <p
                  aria-hidden
                  className="font-display text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] font-light leading-none text-champagne-500/55 md:col-span-2"
                >
                  {principle.index}
                </p>
                <h3 className="font-display text-[clamp(1.5rem,1.2rem+1vw,2.05rem)] font-light leading-[1.15] text-ivory-50 md:col-span-4">
                  {principle.title}
                </h3>
                <p className="measure text-[0.98rem] font-light leading-[1.8] text-muted md:col-span-6">
                  {principle.copy}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
        <RuleLine />
      </div>
    </section>
  );
}
