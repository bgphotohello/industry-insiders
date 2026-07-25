import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { seo } from "@/content/site";
import { siteUrl } from "@/lib/seo/site-url";

import "./globals.css";

/**
 * Type pairing: a high-contrast old-style serif for display, a quiet geometric
 * sans for everything functional.
 *
 * To change the typefaces, swap the imports here and update the two CSS
 * variables — `--font-display` and `--font-sans` in globals.css read from
 * these, so nothing else needs to change.
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-manrope",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#061426",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: seo.title,
    template: `%s | ${seo.shortTitle}`,
  },
  description: seo.description,
  keywords: [...seo.keywords],
  applicationName: seo.shortTitle,
  // Canonical placeholder: resolves against NEXT_PUBLIC_SITE_URL. Set that to
  // the production origin before launch.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: seo.shortTitle,
    title: seo.title,
    description: seo.description,
    url: "/",
    locale: "en_US",
    images: [
      {
        // Placeholder share graphic built from the monogram and brand palette.
        // Replace /public/og/industry-insider-og.png with final artwork at the
        // same 1200x630 size and filename.
        url: "/og/industry-insider-og.png",
        width: 1200,
        height: 630,
        alt: "Industry Insider — Relationships First. Opportunity Follows.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
    images: ["/og/industry-insider-og.png"],
    // Add the handle here once an account exists:
    // site: "@industryinsider",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        {/*
          Without JavaScript there is no intro to dismiss and no reveal to run,
          so the curtain is removed and every animated element is forced to its
          final state. The page is fully readable either way.
        */}
        <noscript>
          <style>{`
            #intro-overlay { display: none !important; }
            [data-motion-reveal],
            [style*="opacity:0"],
            [style*="opacity: 0"] {
              opacity: 1 !important;
              transform: none !important;
            }
          `}</style>
        </noscript>
      </head>
      <body className="min-h-screen bg-navy-950 antialiased">{children}</body>
    </html>
  );
}
