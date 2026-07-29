import type { Metadata } from "next";
import Link from "next/link";

import { DocSection, PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Industry Insider handles the information submitted through its private interest list.",
  alternates: { canonical: "/privacy" },
};

/**
 * NOTE FOR LAUNCH: this page describes exactly what the site does today — one
 * form, one purpose, no selling of data. Before launch, have counsel review it
 * and add the legal entity name and a contact address (see the final section).
 */
export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="PRIVACY"
      title="Private by design."
      intro="Industry Insider is built on trust between professionals. That principle applies to information as much as to introductions."
    >
      <DocSection heading="What we collect">
        <p>
          The interest list form collects your first name, last name, email
          address, cell phone number, company, which of our member categories
          describes you, and your TREC license number. If you are not licensed,
          that last field takes &ldquo;NA&rdquo; and we store it as such. If you
          choose to tell us how you heard about Industry Insider, we keep that
          too. We also record whether you opted in to receive news, invitations,
          and membership information.
        </p>
        <p>
          The license number is collected for one reason: to confirm that people
          joining a professional community are who they say they are. It is not
          published, not shared, and not used to look anything up about you
          beyond that.
        </p>
        <p>
          Nothing else is collected on this site. There is no advertising
          network, no behavioural tracking, and no third-party analytics script
          on this page. What is stored in your browser is set out in the{" "}
          <Link
            href="/cookies"
            className="text-champagne-400 underline underline-offset-4 transition-colors duration-300 hover:text-champagne-300"
          >
            cookie policy
          </Link>
          .
        </p>
      </DocSection>

      <DocSection heading="How we use it">
        <p>
          Your information is used to contact you about Industry Insider:
          founding announcements, event invitations, and membership details as
          they become available. If you did not opt in to receive news and
          invitations, we will limit contact to responding about your interest
          in membership.
        </p>
        <p>
          Your cell number is held so a real person can reach you about
          membership. We do not send automated marketing text messages, and we
          will not begin doing so without asking you separately and clearly
          first.
        </p>
      </DocSection>

      <DocSection heading="What we never do">
        <p>
          We do not sell your information. We do not rent, trade, or share it
          with third parties for their own marketing. Membership interest is a
          confidence, not a commodity.
        </p>
      </DocSection>

      <DocSection heading="Where it is stored">
        <p>
          Submissions are held in the systems we use to run the community — our
          database and email provider — and are accessible only to the people
          operating Industry Insider. Those providers process the data on our
          instructions and for no other purpose.
        </p>
      </DocSection>

      <DocSection heading="Your choices">
        <p>
          You can ask us at any time to show you what we hold, correct it, or
          delete it entirely. Every email we send includes a way to stop
          receiving them, and unsubscribing does not remove you from
          consideration for membership.
        </p>
      </DocSection>

      <DocSection heading="Contact">
        <p>
          Questions about this policy, or a request regarding your information,
          can be raised through the interest list form on the home page until a
          dedicated privacy address is published here ahead of launch.
        </p>
      </DocSection>
    </PageShell>
  );
}
