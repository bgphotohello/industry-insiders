import type { Metadata } from "next";

import { DocSection, PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The terms that apply to the Industry Insider launch site and its private interest list.",
  alternates: { canonical: "/terms" },
};

/**
 * NOTE FOR LAUNCH: these terms cover the launch site only. When the member
 * portal ships, add membership terms — conduct, directory use, event
 * attendance, and termination — and have counsel review the whole document.
 */
export default function TermsPage() {
  return (
    <PageShell
      eyebrow="TERMS"
      title="Terms of use."
      intro="These terms apply to this website and to joining the Industry Insider interest list."
    >
      <DocSection heading="This site">
        <p>
          This is a pre-launch site for Industry Insider, a private professional
          community. The information here describes what is being built and may
          change as the community takes shape.
        </p>
      </DocSection>

      <DocSection heading="The interest list">
        <p>
          Joining the interest list registers your interest. It is not an
          application, and it is not an offer or guarantee of membership.
          Membership details and selection criteria will be announced before
          invitations are issued.
        </p>
        <p>
          Please submit accurate information about yourself and your
          professional role. If you provide a TREC license number, you confirm
          it is your own and current, and you understand it may be verified
          with the Texas Real Estate Commission. Submissions that misrepresent
          identity, licensure, or affiliation may be removed.
        </p>
      </DocSection>

      <DocSection heading="Invitations">
        <p>
          Industry Insider is invitation-led. Decisions about who is invited
          rest with Industry Insider and are made at its discretion.
        </p>
      </DocSection>

      <DocSection heading="Brand and content">
        <p>
          The Industry Insider name, monogram, and the text and design of this
          site belong to Industry Insider. Please do not reproduce them without
          permission.
        </p>
      </DocSection>

      <DocSection heading="Changes">
        <p>
          These terms may be updated as the community launches. The current
          version always appears on this page.
        </p>
      </DocSection>
    </PageShell>
  );
}
