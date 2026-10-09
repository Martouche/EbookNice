/**
 * URL publique du site, sans slash final. Changer de domaine = modifier NEXT_PUBLIC_SITE_URL sur Vercel
 * (sitemap, liens canoniques, emails et partages suivent). Repli : domaine de production Vercel.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/+$/, "");
