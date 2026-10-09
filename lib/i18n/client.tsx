"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext } from "react";
import { localizePath, splitLocalePath, type Locale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

const I18nContext = createContext<{ locale: Locale; t: Dictionary } | null>(null);

/** Le dictionnaire est choisi côté client (il contient des fonctions, non sérialisables depuis le serveur). */
export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, t: getDictionary(locale) }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n doit être utilisé dans <I18nProvider>");
  return ctx;
}

/** `localize("/explorer")` → « /en/explorer » pour un visiteur anglophone. */
export function useLocalize() {
  const { locale } = useI18n();
  return useCallback((href: string) => localizePath(href, locale), [locale]);
}

/** Chemin courant sans le préfixe de langue (`/en/explorer` → `/explorer`), pour l'état actif de la navigation. */
export function usePathWithoutLocale() {
  return splitLocalePath(usePathname()).path;
}
