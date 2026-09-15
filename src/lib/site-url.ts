/**
 * The site's canonical origin, used for metadataBase, the sitemap, and
 * robots.txt.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL — a manual override. Set this once a custom
 *     domain is attached and every URL in the site's metadata follows,
 *     with no component code to touch.
 *  2. VERCEL_PROJECT_PRODUCTION_URL — the project's stable production
 *     domain, set by Vercel on every deployment type (production,
 *     preview, and local `vercel dev`). Deliberately not VERCEL_URL,
 *     which is the *current* deployment's own unique URL and changes
 *     on every push — using it here would make a preview build's
 *     canonical URL point at itself instead of production.
 *  3. http://localhost:3000 — local dev, where neither is set.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
