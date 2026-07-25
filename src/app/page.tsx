import { IntroProvider } from "@/components/intro/IntroProvider";
import { SiteNav } from "@/components/nav/SiteNav";
import { Hero } from "@/components/sections/Hero";
import { LeadCapture } from "@/components/sections/LeadCapture";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { TheIdea } from "@/components/sections/TheIdea";
import { WhatIsComing } from "@/components/sections/WhatIsComing";
import { WhoItIsFor } from "@/components/sections/WhoItIsFor";
import { structuredDataJson } from "@/lib/seo/structured-data";

/**
 * The launch site: one scrolling page.
 *
 * The intro overlay is a sibling of the content, not a wrapper around it, so
 * every section is server-rendered and present in the DOM from the first
 * paint. The overlay is `position: fixed`, so its arrival and departure cause
 * no layout shift.
 */
export default function HomePage() {
  return (
    <IntroProvider>
      <script
        type="application/ld+json"
        // Static, server-generated JSON-LD built from site content.
        dangerouslySetInnerHTML={{ __html: structuredDataJson() }}
      />

      <a
        href="#main"
        className="sr-only-focusable fixed left-6 top-6 z-[100] border border-champagne-500/60 bg-navy-900 px-5 py-3 font-sans text-[0.7rem] uppercase tracking-[0.24em] text-ivory-50"
      >
        Skip to content
      </a>

      <SiteNav />

      <main id="main">
        <Hero />
        <TheIdea />
        <WhoItIsFor />
        <WhatIsComing />
        <LeadCapture />
      </main>

      <SiteFooter />
    </IntroProvider>
  );
}
