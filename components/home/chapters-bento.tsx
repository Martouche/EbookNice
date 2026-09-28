"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Chapter } from "@/lib/types";
import { cn } from "@/lib/utils";

const TINTS = ["bg-ocre", "bg-azur", "bg-terracotta", "bg-emerald-700", "bg-rose-700", "bg-sky-900"];

const LAYOUT = [
  "md:col-span-2 md:row-span-2 min-h-80 md:min-h-0",
  "md:col-span-2",
  "",
  "",
  "md:col-span-2",
  "md:col-span-2",
];

export function ChaptersBento({ chapters, counts }: { chapters: Chapter[]; counts: Record<string, number> }) {
  return (
    <div className="grid auto-rows-[minmax(11rem,auto)] grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:auto-rows-[13rem]">
      {chapters.map((chapter, i) => (
        <motion.div
          key={chapter.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 400, damping: 30, delay: i * 0.04 }}
          className={cn(LAYOUT[i % LAYOUT.length])}
        >
          <Link
            href={`/chapitres/${chapter.slug}`}
            className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-line p-5 md:p-6"
          >
            {chapter.cover_image ? (
              <>
                <Image
                  src={chapter.cover_image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-black/10" />
              </>
            ) : (
              <div className={cn("absolute inset-0 opacity-90", TINTS[i % TINTS.length])} />
            )}

            <div className="relative flex items-start justify-between text-white">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-80">
                Chapitre {String(chapter.order_index || i + 1).padStart(2, "0")}
              </span>
              <span className="grid size-9 place-items-center rounded-full border border-white/25 transition-transform duration-150 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </div>

            <div className="relative text-white">
              <h3 className={cn("font-display leading-[0.95]", i === 0 ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl")}>
                {chapter.title}
              </h3>
              {chapter.description && (
                <p className={cn("mt-2 max-w-sm text-sm leading-snug text-white/80", i !== 0 && "line-clamp-2")}>
                  {chapter.description}
                </p>
              )}
              <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">
                {counts[chapter.id] ?? 0} adresses
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
