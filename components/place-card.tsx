"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import Link from "next/link";
import { BEST_TIME_LABELS, priceLabel } from "@/lib/constants";
import type { PlaceWithRelations } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "./favorite-button";
import { PlaceImages } from "./place-images";
import { Badge } from "./ui/badge";

export function PlaceCard({
  place,
  index,
  compact,
  active,
  priority,
  onHoverChange,
}: {
  place: PlaceWithRelations;
  index?: number;
  compact?: boolean;
  /** Mise en évidence (survol du marqueur correspondant sur la carte). */
  active?: boolean;
  priority?: boolean;
  onHoverChange?: (hovered: boolean) => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      whileHover={{ y: -3 }}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      className={cn(
        "group relative overflow-hidden rounded-3xl border bg-card transition-[border-color,box-shadow] duration-100",
        active ? "border-ocre shadow-[0_0_0_3px_rgb(227_161_59/0.25)]" : "border-line",
      )}
    >
      <Link href={`/lieux/${place.slug}`} className="block">
        <div className={cn("relative overflow-hidden", compact ? "aspect-[16/10]" : "aspect-[4/5]")}>
          <PlaceImages
            images={place.images}
            title={place.title}
            category={place.category}
            priority={priority}
            sizes={compact ? "(min-width: 768px) 320px, 80vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/5 to-transparent" />

          <div className="pointer-events-none absolute top-3.5 left-3 flex flex-wrap gap-1.5">
            {place.is_free && <Badge variant="free">Gratuit · FREE</Badge>}
            {place.category && <Badge variant="glass">{place.category.name}</Badge>}
          </div>

          <div className="pointer-events-none absolute right-0 bottom-0 left-0 p-4 text-white">
            {index !== undefined && (
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/60">
                N°{String(index + 1).padStart(2, "0")}
              </span>
            )}
            <h3 className={cn("font-display leading-[1.05]", compact ? "text-2xl" : "text-3xl")}>{place.title}</h3>
            <p className="mt-1.5 flex items-center gap-2 text-xs text-white/75">
              <span>{place.city}</span>
              <span className="size-0.5 rounded-full bg-white/50" />
              <span>{priceLabel(place.price_level)}</span>
              {!compact && (
                <>
                  <span className="size-0.5 rounded-full bg-white/50" />
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {BEST_TIME_LABELS[place.best_time_to_visit]}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </Link>
      <FavoriteButton placeId={place.id} className="absolute top-3 right-3 z-10" />
    </motion.article>
  );
}
