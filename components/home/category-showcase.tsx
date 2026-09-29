"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/constants";
import { BLUR_DATA_URL } from "@/lib/image";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ShowcaseItem {
  category: Category;
  title: string;
  tagline: string;
  count: number;
  /** Première photo de chaque adresse de la catégorie (coups de cœur d'abord), 3 max. */
  photos: string[];
}

/** Desktop : 2 grandes tuiles puis 3 ; tablette : 2 colonnes ; mobile : empilées. */
const LAYOUT = [
  "md:col-span-3 lg:col-span-3 lg:h-[34rem]",
  "md:col-span-3 lg:col-span-3 lg:h-[34rem]",
  "md:col-span-2 lg:col-span-2 lg:h-[28rem]",
  "md:col-span-2 lg:col-span-2 lg:h-[28rem]",
  "md:col-span-2 lg:col-span-2 lg:h-[28rem]",
];

/** Mosaïque de fond : 1 photo plein cadre, 2 côte à côte, ou 1 grande + 2 empilées. */
function Mosaic({ photos, sizes, color, icon }: { photos: string[]; sizes: string; color: string; icon: string }) {
  if (photos.length === 0) {
    return (
      <div className="absolute inset-0" style={{ backgroundColor: color }}>
        <CategoryIcon icon={icon} className="absolute -right-8 -bottom-8 size-56 text-white/15" strokeWidth={1} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute inset-0 grid gap-0.5 bg-black",
        photos.length === 2 && "grid-cols-2",
        photos.length >= 3 && "grid-cols-[1.6fr_1fr] grid-rows-2",
      )}
    >
      {photos.map((src, i) => (
        <div key={src} className={cn("relative overflow-hidden", photos.length >= 3 && i === 0 && "row-span-2")}>
          <Image
            src={src}
            alt=""
            fill
            sizes={i === 0 ? sizes : "(min-width: 1024px) 20vw, 40vw"}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>
      ))}
    </div>
  );
}

export function CategoryShowcase({ items }: { items: ShowcaseItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-6 md:gap-4">
      {items.map((item, i) => {
        const color = CATEGORY_COLORS[item.category.slug] ?? DEFAULT_CATEGORY_COLOR;
        const big = i < 2;
        return (
          <motion.div
            key={item.category.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: (i % 3) * 0.05 }}
            className={cn("h-80 sm:h-96", LAYOUT[i] ?? "md:col-span-2 lg:h-[28rem]")}
          >
            <Link
              href={`/explorer?category=${item.category.slug}`}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] border border-line text-white"
            >
              <Mosaic
                photos={item.photos}
                color={color}
                icon={item.category.icon}
                sizes={big ? "(min-width: 768px) 35vw, 70vw" : "(min-width: 1024px) 22vw, (min-width: 768px) 35vw, 70vw"}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/10" />

              <div className="relative flex items-start justify-between gap-3 p-5 md:p-6">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: color }}
                >
                  <CategoryIcon icon={item.category.icon} className="size-3.5" />
                  {item.count} adresse{item.count > 1 ? "s" : ""}
                </span>
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/30 bg-black/20 backdrop-blur-md transition-transform duration-150 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>

              <div className="relative p-5 md:p-7">
                <h3
                  className={cn(
                    "font-display leading-[0.95] text-balance drop-shadow-[0_2px_16px_rgb(0_0_0/0.4)]",
                    big ? "text-[2.75rem] md:text-6xl lg:text-7xl" : "text-[2.5rem] md:text-5xl",
                  )}
                >
                  {item.title}
                </h3>
                <p className={cn("mt-3 max-w-md text-sm leading-snug text-white/85 md:text-base", !big && "line-clamp-2")}>
                  {item.tagline}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
