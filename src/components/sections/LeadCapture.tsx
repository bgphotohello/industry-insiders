import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { interest } from "@/content/site";
import { getTurnstileSiteKey } from "@/lib/security/turnstile";

import { LeadForm } from "./LeadForm";

/**
 * The invitation.
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
      className="relative overflow-hidden border-t border-rule-soft py-24 md:py-36 lg:py-44"
    >
      {/* The page warms toward its close: a deeper navy panel, lifted at the
          centre, so the final section reads like an opened envelope. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-navy-900/45"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(85% 65% at 50% 12%, rgba(200,161,90,0.10) 0%, rgba(6,20,38,0) 62%)",
        }}
      />

      <div className="shell relative">
        <div className="max-w-2xl">
          <Reveal>
            <MicroLabel>{interest.label}</MicroLabel>
          </Reveal>

          <MaskedHeading
            as="h2"
            id="interest-heading"
            className="mt-8 font-display text-[clamp(2.4rem,1.7rem+3.2vw,4.6rem)] font-light leading-[1.02] tracking-[-0.015em] text-ivory-50"
          >
            {interest.heading}
          </MaskedHeading>

          <Reveal delay={0.1}>
            <p className="measure mt-8 text-[clamp(1rem,0.95rem+0.26vw,1.12rem)] font-light leading-[1.8] text-muted">
              {interest.body}
            </p>
          </Reveal>
        </div>

        <div className="max-w-3xl">
          <LeadForm turnstileSiteKey={turnstileSiteKey} />
        </div>
      </div>
    </section>
  );
}
