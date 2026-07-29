import type { Metadata } from "next";
import Link from "next/link";

import { DocSection, PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Cookies",
  description:
    "What Industry Insider stores in your browser, and why there are currently no cookies on this site.",
  alternates: { canonical: "/cookies" },
};

/**
 * NOTE FOR LAUNCH: every claim on this page is a statement of fact about the
 * code as it stands, verified against it rather than assumed:
 *
 *   - nothing in src/ sets a cookie, reads document.cookie, or calls next/headers
 *     cookies()
 *   - the only browser storage is one sessionStorage key, "ii:intro-seen:v1"
 *   - no analytics, advertising or tag-manager script is loaded anywhere
 *   - Turnstile is the one third party that would set a cookie, and it is only
 *     loaded when TURNSTILE_SITE_KEY is configured, which it currently is not
 *
 * If any of that changes — analytics, a pixel, an embedded video, a chat
 * widget, Turnstile going live — this page has to change with it, or it becomes
 * untrue. Have counsel review before launch.
 */
export default function CookiesPage() {
  return (
    <PageShell
      eyebrow="COOKIES"
      title="No cookies. For now, none at all."
      intro="Most sites open with a banner asking permission to track you. This one has nothing to ask for, and would rather say so plainly than perform a choice that isn't real."
    >
      <DocSection heading="What this site stores">
        <p>
          This site sets no cookies. There is no advertising network, no
          analytics script, no tag manager, and no third-party pixel on any
          page.
        </p>
        <p>
          One thing is stored in your browser: a single entry in session
          storage, recording that you have already seen the opening animation so
          it does not replay every time you move around the site. It holds no
          identifier and nothing about you, it is never sent to a server, and
          your browser discards it the moment you close the tab.
        </p>
      </DocSection>

      <DocSection heading="Why there is no banner">
        <p>
          Consent banners exist to obtain permission for tracking. With no
          tracking to permit, a banner would be theatre — an interruption that
          implies a choice you are not actually being given. When that changes,
          this page changes first, and anything requiring consent will ask for
          it properly.
        </p>
      </DocSection>

      <DocSection heading="What would change this">
        <p>
          As Industry Insider grows, some of the following may be introduced:
          privacy-respecting analytics, an anti-spam check on the interest list
          form, or a members&rsquo; area that needs a cookie to keep you signed
          in. A sign-in cookie is strictly necessary and works without consent;
          analytics is not, and would be opt-in.
        </p>
        <p>
          Whichever arrives first, this page will name it, say what it does, and
          say how long it lasts, before it is switched on.
        </p>
      </DocSection>

      <DocSection heading="Managing what is stored">
        <p>
          Every browser lets you view and clear cookies and site data, usually
          under privacy settings, and can block them for individual sites. Since
          this site stores only the single session entry described above,
          clearing it costs you nothing beyond seeing the opening animation once
          more.
        </p>
      </DocSection>

      <DocSection heading="Related">
        <p>
          What we collect when you join the interest list, and what we do with
          it, is set out in the{" "}
          <Link
            href="/privacy"
            className="text-champagne-400 underline underline-offset-4 transition-colors duration-300 hover:text-champagne-300"
          >
            privacy policy
          </Link>
          .
        </p>
      </DocSection>
    </PageShell>
  );
}
