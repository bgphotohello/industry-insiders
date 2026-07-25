import type { Metadata } from "next";
import Link from "next/link";

import { DocSection, PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "How to reach Industry Insider ahead of launch, and how to join the private interest list.",
  alternates: { canonical: "/contact" },
};

/**
 * NOTE FOR LAUNCH: no email address is shown because none has been supplied.
 * Publishing a placeholder address would be worse than publishing none — add
 * the real one here, and in the Privacy page's Contact section, when it exists.
 */
export default function ContactPage() {
  return (
    <PageShell
      eyebrow="CONTACT"
      title="Start with a conversation."
      intro="Industry Insider is being built quietly, ahead of a formal launch. The interest list is the way in."
    >
      <DocSection heading="Interest in membership">
        <p>
          Join the private interest list to receive founding announcements,
          event invitations, and membership information as it becomes available.
          Every submission is read.
        </p>
        <p>
          <Link
            href="/#interest"
            className="inline-flex border border-champagne-500/45 px-7 py-3 font-sans text-[0.7rem] font-medium uppercase tracking-[0.26em] text-ivory-50 transition-[border-color,background-color] duration-500 hover:border-champagne-400/90 hover:bg-champagne-500/[0.07]"
          >
            Request an invitation
          </Link>
        </p>
      </DocSection>

      <DocSection heading="Partnerships and press">
        <p>
          For partnership or press enquiries ahead of launch, use the interest
          list form and note the reason in the final field. A dedicated address
          will be published here before the community opens.
        </p>
      </DocSection>

      <DocSection heading="Where we are">
        <p>Dallas–Fort Worth, Texas.</p>
      </DocSection>
    </PageShell>
  );
}
