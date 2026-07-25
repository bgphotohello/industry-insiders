import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { interest } from "@/content/site";
import { getTurnstileSiteKey } from "@/lib/security/turnstile";

import { LeadForm } from "./LeadForm";

/**
 * The invitation.
 *
 * Laid out as in the comp: the statement on the left, the fields on the right,
 * with the closing phrase of the heading in champagne italic.
 *
 * A server component so the Turnstile site key can be read from the
 * environment and handed to the form as a prop — no Turnstile value is ever
 * inlined into the client bundle, and with no key configured the widget and
 * its third-party script simply never exist.
 */
export function LeadCapture() {
  const turnstileSiteKey = getTurnstileSiteKey();

  return (
    <section
      id={interest.id}
      aria-labelledby="interest-heading"
      className="relative overflow-hidden border-t border-rule-soft py-20 md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-navy-900/50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 22% 20%, rgba(200,161,90,0.09) 0%, rgba(1,8,22,0) 62%)",
        }}
      />

      <div className="shell relative grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <Reveal>
            <MicroLabel variant="plain">{interest.label}</MicroLabel>
          </Reveal>

          <MaskedHeading
            as="h2"
            id="interest-heading"
            className="mt-6 font-display text-[clamp(2.1rem,1.5rem+2.6vw,3.4rem)] font-light leading-[1.06] tracking-[-0.012em] text-ivory-50"
          >
            {interest.heading.line1}{" "}
            <span className="italic text-champagne-400">
              {interest.heading.accent}
            </span>
          </MaskedHeading>

          <Reveal delay={0.1}>
            <p className="measure mt-7 text-[0.98rem] font-light leading-[1.8] text-muted">
              {interest.body}
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <LeadForm turnstileSiteKey={turnstileSiteKey} />
        </div>
      </div>
    </section>
  );
}
