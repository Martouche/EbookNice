"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { CATEGORY_COLORS, CATEGORY_INK, CATEGORY_LIGHT_BG, DEFAULT_CATEGORY_COLOR } from "@/lib/constants";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CategoryIllustration } from "./category-illustrations";

export interface ShowcaseItem {
  category: Category;
  title: string;
  tagline: string;
  count: number;
}

const MotionLink = motion.create(Link);

/** Desktop : 2 grandes tuiles puis 3 ; tablette : 2 colonnes ; mobile : empilées. */
const LAYOUT = [
  "md:col-span-3 lg:h-[34rem]",
  "md:col-span-3 lg:h-[34rem]",
  "md:col-span-2 lg:h-[28rem]",
  "md:col-span-2 lg:h-[28rem]",
  "md:col-span-2 lg:h-[28rem]",
];

const spring = { type: "spring", stiffness: 400, damping: 30 } as const;

export function CategoryShowcase({ items }: { items: ShowcaseItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-6 md:gap-4">
      {items.map((item, i) => {
        const { slug, icon } = item.category;
        const color = CATEGORY_COLORS[slug] ?? DEFAULT_CATEGORY_COLOR;
        const ink = CATEGORY_INK[slug] ?? "#14120f";
        const lightBg = CATEGORY_LIGHT_BG.has(slug);
        const big = i < 2;

        return (
          <motion.div
            key={item.category.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ ...spring, delay: (i % 3) * 0.05 }}
            className={cn("h-[26rem] sm:h-[28rem] md:h-[26rem]", LAYOUT[i] ?? "md:col-span-2 lg:h-[28rem]")}
          >
            <MotionLink
              href={`/explorer?category=${slug}`}
              initial="rest"
              animate="rest"
              whileHover="hover"
              whileTap={{ scale: 0.985 }}
              transition={spring}
              style={{ backgroundColor: color, "--ink": ink } as CSSProperties}
              className={cn(
                "flex h-full flex-col overflow-hidden rounded-[1.75rem]",
                lightBg ? "text-(--ink)" : "text-white",
              )}
            >
              <div className="flex items-start justify-between gap-3 p-5 md:p-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-(--ink)">
                  <CategoryIcon icon={icon} className="size-3.5" />
                  {item.count} adresse{item.count > 1 ? "s" : ""}
                </span>
                <motion.span
                  variants={{ rest: { rotate: 0 }, hover: { rotate: 45 } }}
                  transition={spring}
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full border",
                    lightBg ? "border-(--ink)/30" : "border-white/35",
                  )}
                >
                  <ArrowUpRight className="size-4" />
                </motion.span>
              </div>

              <motion.div
                variants={{ rest: { y: 0, scale: 1 }, hover: { y: -6, scale: 1.03 } }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="relative min-h-0 flex-1"
              >
                <CategoryIllustration slug={slug} className="absolute inset-0 h-full w-full" />
              </motion.div>

              <div className="p-5 md:p-7">
                <h3
                  className={cn(
                    "font-display leading-[0.95] text-balance",
                    big ? "text-[2.75rem] md:text-6xl lg:text-7xl" : "text-[2.5rem] md:text-5xl",
                  )}
                >
                  {item.title}
                </h3>
                <p className={cn("mt-2.5 max-w-md text-sm leading-snug md:text-base", lightBg ? "opacity-80" : "text-white/85", !big && "line-clamp-2")}>
                  {item.tagline}
                </p>
              </div>
            </MotionLink>
          </motion.div>
        );
      })}
    </div>
  );
}
