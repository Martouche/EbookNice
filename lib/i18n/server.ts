import "server-only";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_HEADER, isLocale, localizePath, type Locale } from "./config";
import { getDictionary } from "./dictionaries";

/** Langue de la requête : celle de l'URL (transmise par le middleware), sinon le cookie (routes non préfixées). */
export const getLocale = cache(async (): Promise<Locale> => {
  const fromUrl = (await headers()).get(LOCALE_HEADER);
  if (isLocale(fromUrl)) return fromUrl;
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
});

export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}

/** URL canonique + versions linguistiques (hreflang) d'une page, pour Google. */
export async function localeAlternates(path: string): Promise<Metadata["alternates"]> {
  const locale = await getLocale();
  return {
    canonical: localizePath(path, locale),
    languages: { fr: localizePath(path, "fr"), en: localizePath(path, "en"), "x-default": localizePath(path, "fr") },
  };
}
