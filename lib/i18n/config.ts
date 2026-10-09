export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";
/** Cookie qui mémorise la langue choisie (sélecteur FR | EN ou détection à la première visite). */
export const LOCALE_COOKIE = "lang";

export const isLocale = (value: unknown): value is Locale => LOCALES.includes(value as Locale);

/**
 * Première visite : français si la langue préférée du navigateur est le français, anglais sinon
 * (touristes anglophones, mais aussi germanophones, italophones… pour qui l'anglais est le meilleur repli).
 */
export function detectLocale(acceptLanguage: string | null | undefined): Locale {
  const preferred = acceptLanguage?.split(",")[0]?.trim().toLowerCase() ?? "";
  if (!preferred || preferred === "*") return DEFAULT_LOCALE;
  return preferred.startsWith("fr") ? "fr" : "en";
}

/** En-tête interne posé par le middleware : langue déduite de l'URL (`/en/…` → en). */
export const LOCALE_HEADER = "x-locale";

/** Routes hors i18n (back-office en français, callbacks d'auth) : jamais préfixées. */
const UNLOCALIZED = ["/admin", "/auth"];

/** Pages du guide uniquement : ni back-office, ni fichiers (`/sitemap.xml`, `/sw.js`, `/manifest.webmanifest`…). */
export const isLocalizable = (path: string) =>
  !UNLOCALIZED.some((p) => path === p || path.startsWith(`${p}/`)) && !/\.[a-z0-9]+$/i.test(path);

/** `/en/lieux/x` → { locale: "en", path: "/lieux/x" } ; `/lieux/x` → { locale: null, path: "/lieux/x" }. */
export function splitLocalePath(pathname: string): { locale: Locale | null; path: string } {
  const match = /^\/(en)(\/.*)?$/.exec(pathname);
  return match ? { locale: match[1] as Locale, path: match[2] || "/" } : { locale: null, path: pathname };
}

/**
 * Chemin interne dans la langue voulue : le français (langue par défaut) n'a pas de préfixe, l'anglais vit sous `/en`.
 * Accepte une query string / un hash (`/explorer?view=map`, `/#envies`). Les URL externes sont renvoyées telles quelles.
 */
export function localizePath(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const [, pathname = "/", rest = ""] = /^([^?#]*)(.*)$/.exec(href) ?? [];
  const { path } = splitLocalePath(pathname || "/");
  if (locale === DEFAULT_LOCALE || !isLocalizable(path)) return `${path}${rest}`;
  return `/${locale}${path === "/" ? "" : path}${rest}`;
}
