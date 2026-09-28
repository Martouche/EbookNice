"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, Map } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const spring = { type: "spring", stiffness: 400, damping: 30 } as const;

export function Hero({ stats }: { stats: { places: number; free: number; chapters: number } }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* Horizon : soleil couchant sur la Baie des Anges */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%]">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.15 }}
          className="absolute right-[8%] bottom-[38%] size-44 rounded-full bg-ocre md:right-[14%] md:size-72"
        />
        <div className="absolute inset-x-0 bottom-0 h-[38%] border-t border-line-strong bg-linear-to-b from-azur/30 to-azur/5 backdrop-blur-sm" />
        <div className="absolute inset-x-0 bottom-[30%] h-px bg-line-strong" />
        <div className="absolute inset-x-[20%] bottom-[22%] h-px bg-line" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100dvh-8rem)] max-w-7xl flex-col px-4 pt-6 pb-40 md:min-h-[88vh] md:px-8 md:pt-10">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
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
            className="font-display text-[clamp(3.5rem,13vw,10rem)] leading-[0.85] tracking-[-0.02em]"
          >
            Nice
            <span className="block text-[0.5em] leading-[1] text-muted-foreground italic">& la Côte d&apos;Azur</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"
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
            <Button asChild size="lg" variant="glass">
              <Link href="/explorer?view=map">
                <Map />
                Carte interactive
              </Link>
            </Button>
          </motion.div>
        </div>

        <dl className="relative mt-12 grid max-w-md grid-cols-3 divide-x divide-line border-y border-line">
          {[
            { label: "Adresses", value: stats.places },
            { label: "Gratuites", value: stats.free },
            { label: "Chapitres", value: stats.chapters },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3 first:pl-0">
              <dt className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">{s.label}</dt>
              <dd className="font-display text-3xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
