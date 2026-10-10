import type { MetadataRoute } from "next";
import { localizePath } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";

/** Application installable (« Ajouter à l'écran d'accueil ») : plein écran, icône « N. », dans la langue du visiteur. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { locale, t } = await getI18n();
  return {
    name: locale === "en" ? "Nice · The Locals' Guide" : "Nice · Le Guide des Locaux",
    short_name: "Nice.",
    description: t.meta.description,
    lang: locale,
    start_url: localizePath("/", locale),
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0b0a",
    theme_color: "#0b0b0a",
    categories: ["travel", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: t.nav.explorer, url: localizePath("/explorer?view=map", locale) },
      { name: t.nav.carnet, url: localizePath("/favoris", locale) },
    ],
  };
}
