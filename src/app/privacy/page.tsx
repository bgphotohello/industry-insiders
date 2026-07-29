import type { Metadata } from "next";

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
          address, cell phone number, company, professional role, and — if you
          choose to share it — how you heard about Industry Insider. If you are
          a licensed real estate agent, it also collects your TREC license
          number, which we may use to confirm licensure with the Texas Real
          Estate Commission; if you are not a realtor, you simply enter
          &ldquo;NA&rdquo;. The form also records whether you opted in to
          receive news, invitations, and membership information.
        </p>
        <p>
          Nothing else is collected on this site. There is no advertising
          network, no behavioural tracking, and no third-party analytics script
          on this page. See the{" "}
          <a href="/cookies" className="underline decoration-champagne-500/50 underline-offset-4 hover:decoration-champagne-400">
            cookie policy
          </a>{" "}
          for the short story on cookies and browser storage.
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
