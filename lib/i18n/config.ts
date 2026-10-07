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
