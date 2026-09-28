"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import Link from "next/link";
import { BEST_TIME_LABELS, priceLabel } from "@/lib/constants";
import type { PlaceWithRelations } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "./favorite-button";
import { PlaceCover } from "./place-cover";
import { Badge } from "./ui/badge";

export function PlaceCard({
  place,
  index,
  compact,
  selected,
  onSelect,
}: {
  place: PlaceWithRelations;
  index?: number;
  compact?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      whileHover={{ y: -3 }}
      onClick={onSelect}
      className={cn(
        "group relative overflow-hidden rounded-3xl border bg-card transition-colors duration-100",
        selected ? "border-ocre" : "border-line",
      )}
    >
      <Link href={`/lieux/${place.slug}`} className="block" onClick={(e) => onSelect && !selected && e.preventDefault()}>
        <div className={cn("relative overflow-hidden", compact ? "aspect-[16/10]" : "aspect-[4/5]")}>
          <PlaceCover
            src={place.images[0]}
            title={place.title}
            category={place.category}
            className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {place.is_free && <Badge variant="free">Gratuit · FREE</Badge>}
            {place.category && <Badge variant="glass">{place.category.name}</Badge>}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            {index !== undefined && (
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/60">
                N°{String(index + 1).padStart(2, "0")}
              </span>
            )}
            <h3 className={cn("font-display leading-[1.05]", compact ? "text-2xl" : "text-3xl")}>{place.title}</h3>
            <p className="mt-1.5 flex items-center gap-2 text-xs text-white/70">
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
      <FavoriteButton placeId={place.id} className="absolute top-3 right-3" />
    </motion.article>
  );
}
