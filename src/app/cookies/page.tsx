import type { Metadata } from "next";

import { DocSection, PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Cookies",
  description:
    "How the Industry Insider launch site uses cookies and browser storage — which is to say, barely at all.",
  alternates: { canonical: "/cookies" },
};

/**
 * NOTE FOR LAUNCH: this page describes exactly what the site does today. If
 * analytics, embedded media, or the member portal are added later, list their
 * cookies here before they ship, and have counsel review alongside the
 * privacy policy.
 */
export default function CookiesPage() {
  return (
    <PageShell
      eyebrow="COOKIES"
      title="Cookies, kept simple."
      intro="This site is deliberately quiet. No advertising cookies, no tracking pixels, no analytics profiles — here is the complete list of what your browser stores."
    >
      <DocSection heading="What cookies are">
        <p>
          Cookies are small pieces of text a website asks your browser to keep,
          usually so the site can recognise you between pages or visits. A close
          cousin, browser storage, keeps similar notes that never leave your
          device.
        </p>
      </DocSection>

      <DocSection heading="What this site stores">
        <p>
          One thing: a temporary note in your browser&rsquo;s session storage
          that records whether the opening animation has already played, so it
          does not replay every time you return to the page. It contains no
          personal information, it is never sent to us, and your browser
          discards it when the tab closes.
        </p>
      </DocSection>

      <DocSection heading="Security verification">
        <p>
          When our form protection service (Cloudflare Turnstile) is active, it
          may set a cookie solely to distinguish people from automated scripts
          while you complete the interest form. It is used for security, not
          advertising, and does not follow you across other websites.
        </p>
      </DocSection>

      <DocSection heading="What this site does not do">
        <p>
          There are no advertising cookies, no social media pixels, no
          cross-site trackers, and no third-party analytics on this site. We do
          not build profiles of visitors, and we do not share browsing
          information with anyone.
        </p>
      </DocSection>

      <DocSection heading="Your choices">
        <p>
          Because nothing here is used to track you, there is nothing to opt
          out of. You can still clear or block cookies and site data at any
          time in your browser&rsquo;s settings; the only effect on this site
          is that the opening animation may play again.
        </p>
      </DocSection>

      <DocSection heading="Changes">
        <p>
          If the site ever begins using additional cookies — for example, when
          the member area launches — this page will be updated first, and the
          current version will always live at this address.
        </p>
      </DocSection>
    </PageShell>
  );
}
