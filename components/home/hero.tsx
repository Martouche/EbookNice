"use client";

import { ArrowDownRight, Map } from "lucide-react";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/client";
import { HeroVideo } from "./hero-video";

/**
 * Hero : 4 éléments de texte (surtitre, titre, accroche, 2 CTA), calé en bas à gauche sur la vidéo.
 * Texte statique, visible dès le rendu serveur (LCP) : le seul mouvement est le fondu de la vidéo,
 * qui n'est pas chargée sous « réduire les animations ».
 */
export function Hero() {
  const { t } = useI18n();
  return (
    // Passe sous le header (-mt) : la vidéo démarre tout en haut ; 100svh : hauteur stable quand la barre d'adresse mobile se replie.
    <section className="relative -mt-[var(--header-h)] overflow-hidden text-white">
      <HeroVideo />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pt-[calc(var(--header-h)+1.5rem)] pb-28 md:px-8 md:pb-20">
        <div className="max-w-4xl">
          <p className="mb-4 text-sm font-medium tracking-wide text-ocre">{t.hero.kicker}</p>
          <h1 className="font-display text-[clamp(3.5rem,13vw,9rem)] leading-[0.9] tracking-tighter drop-shadow-[0_2px_24px_rgb(20_18_15/0.35)]">
            Nice
            <span className="block pb-1 text-[0.5em] leading-[1.1] text-white/85 italic">{t.hero.subtitle}</span>
          </h1>
          <p className="mt-6 max-w-[42ch] text-base leading-relaxed text-white/85 md:text-lg">{t.hero.lead}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="accent">
              <a href="#envies">
                {t.hero.ctaExplore}
                <ArrowDownRight />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-scrim text-white hover:bg-[#14120f]">
              <Link href="/explorer?view=map">
                <Map />
                {t.hero.ctaMap}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
