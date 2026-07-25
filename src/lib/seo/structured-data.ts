import { brand, seo } from "@/content/site";

import { siteUrl } from "./site-url";

/**
 * Organization + WebSite structured data.
 *
 * Both describe only what is true today. There are no member counts, no
 * founding dates, no awards and no social profiles — invented figures in
 * structured data are exactly the kind of thing that erodes trust in a brand
 * built on it. Add `sameAs` entries here when real accounts exist.
 */
export function buildStructuredData() {
  const organization = {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: brand.name,
    url: siteUrl,
    slogan: brand.tagline,
    description: seo.description,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/brand/industry-insider-logo.svg`,
    },
    image: `${siteUrl}/og/industry-insider-og.png`,
    areaServed: {
      "@type": "Place",
      name: brand.location,
    },
    address: {
      "@type": "PostalAddress",
      addressRegion: "TX",
      addressCountry: "US",
    },
  };

  const website = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: brand.name,
    description: seo.description,
    inLanguage: "en-US",
    publisher: { "@id": `${siteUrl}/#organization` },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, website],
  };
}

/**
 * Serialises the graph for a <script type="application/ld+json"> tag, escaping
 * the one sequence that could break out of it.
 */
export function structuredDataJson(): string {
  return JSON.stringify(buildStructuredData()).replace(/</g, "\\u003c");
}
