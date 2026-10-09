"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { LOCALE_COOKIE, LOCALES, localizePath, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/**
 * Bascule FR | EN. Changement rare : on mémorise le choix (cookie) et on charge la même page dans l'autre langue
 * (`/lieux/x` ⇄ `/en/lieux/x`) — interface et lieux en base sont re-rendus côté serveur, sans état intermédiaire.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const [pending, setPending] = useState<Locale | null>(null);

  const choose = (next: Locale) => {
    if (next === locale) return;
    setPending(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    const { pathname, search, hash } = window.location;
    window.location.assign(localizePath(pathname, next) + search + hash);
  };

  const shown = pending ?? locale;

  return (
    <div
      role="radiogroup"
      aria-label={t.language.label}
      className={cn("flex h-9 items-center rounded-full border border-line p-0.5", pending && "opacity-60", className)}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={l === shown}
          lang={l}
          title={l === locale ? undefined : t.language.switchTo}
          onClick={() => choose(l)}
          className={cn(
            "relative h-full rounded-full px-2.5 font-mono text-[11px] font-medium tracking-wider uppercase transition-colors duration-100",
            l === shown ? "text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l === shown && (
            <motion.span
              layoutId="language-pill"
              className="absolute inset-0 rounded-full bg-foreground"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative">{l}</span>
        </button>
      ))}
    </div>
  );
}
