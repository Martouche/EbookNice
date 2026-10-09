import type { MetadataRoute } from "next";
import { getChapters, getPlaces } from "@/lib/data";
import { localizePath } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/site";

// Régénéré au plus toutes les heures : les nouveaux spots de l'admin y apparaissent automatiquement.
export const revalidate = 3600;

/** Chaque page en français et en anglais, reliées entre elles (hreflang) pour que Google propose la bonne langue. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [places, chapters] = await Promise.all([getPlaces(undefined, { raw: true }), getChapters({ raw: true })]);

  const entry = (path: string, priority: number, lastModified?: string) => {
    const languages = { fr: SITE_URL + localizePath(path, "fr"), en: SITE_URL + localizePath(path, "en") };
    return (["fr", "en"] as const).map((locale) => ({
      url: languages[locale],
      lastModified: lastModified ? new Date(lastModified) : undefined,
      priority,
      alternates: { languages },
    }));
  };

  return [
    ...entry("/", 1),
    ...entry("/explorer", 0.9),
    ...places.flatMap((p) => entry(`/lieux/${p.slug}`, p.is_featured ? 0.8 : 0.7, p.created_at)),
    ...chapters.flatMap((c) => entry(`/chapitres/${c.slug}`, 0.5)),
    ...entry("/confidentialite", 0.1),
  ];
}
