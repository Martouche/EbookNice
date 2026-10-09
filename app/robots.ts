import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Pages personnelles et back-office hors index ; tout le guide (FR et /en) est ouvert aux moteurs.
const PRIVATE = ["/admin", "/auth", "/compte", "/favoris", "/connexion", "/carnet"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: [...PRIVATE, ...PRIVATE.map((p) => `/en${p}`)] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
