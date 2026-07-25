/**
 * The canonical origin for this deployment.
 *
 * Order of preference:
 *   1. NEXT_PUBLIC_SITE_URL — set this in production; it is what canonical
 *      tags, Open Graph URLs, robots.txt and the sitemap resolve against.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — correct on Vercel before a custom
 *      domain is attached.
 *   3. localhost — development.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();
