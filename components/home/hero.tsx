"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, Map } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroVideo } from "./hero-video";

const spring = { type: "spring", stiffness: 400, damping: 30 } as const;

export function Hero({ stats }: { stats: { places: number; free: number; chapters: number } }) {
  return (
    // Passe sous le header en verre (-mt) ; 100svh : hauteur stable quand la barre d'adresse mobile se replie.
    <section className="relative -mt-[var(--header-h)] overflow-hidden text-white">
      <HeroVideo />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col px-4 pt-[calc(var(--header-h)+1.5rem)] pb-28 md:px-8 md:pt-[calc(var(--header-h)+2rem)] md:pb-12">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-white/70 uppercase">
          <span>Édition 2026 — N°01</span>
          <span>43°42′N · 7°15′E</span>
        </div>

        <div className="mt-auto max-w-4xl pt-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="mb-4 text-sm font-medium tracking-wide text-ocre"
          >
            Le guide des locaux
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.05 }}
            className="font-display text-[clamp(3.5rem,13vw,10rem)] leading-[0.85] tracking-[-0.02em] drop-shadow-[0_2px_24px_rgb(0_0_0/0.35)]"
          >
            Nice
            <span className="block text-[0.5em] leading-[1] text-white/80 italic">& la Côte d&apos;Azur</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="mt-6 max-w-md text-base leading-relaxed text-white/85 md:text-lg"
          >
            Les adresses que les Niçois se transmettent de bouche à oreille. Criques, belvédères, socca et sentiers —
            sans les pièges à touristes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button asChild size="lg" variant="accent">
              <a href="#sommaire">
                Ouvrir le sommaire
                <ArrowDownRight />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20">
              <Link href="/explorer?view=map">
                <Map />
                Carte interactive
              </Link>
            </Button>
          </motion.div>
        </div>

        <dl className="relative mt-12 grid max-w-md grid-cols-3 divide-x divide-white/20 border-y border-white/20">
          {[
            { label: "Adresses", value: stats.places },
            { label: "Gratuites", value: stats.free },
            { label: "Chapitres", value: stats.chapters },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3 first:pl-0">
              <dt className="font-mono text-[10px] tracking-[0.18em] text-white/65 uppercase">{s.label}</dt>
              <dd className="font-display text-3xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
