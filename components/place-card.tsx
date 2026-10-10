"use client";

import { motion } from "motion/react";
import { Clock, Navigation } from "lucide-react";
import { formatDistance } from "@/lib/geo";
import Link from "@/components/link";
import { useI18n } from "@/lib/i18n/client";
import type { PlaceWithRelations } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "./favorite-button";
import { PlaceImages } from "./place-images";
import { Badge } from "./ui/badge";
import { exitFast, motionTokens, springs } from "@/lib/motion-tokens";

export function PlaceCard({
  place,
  compact,
  active,
  priority,
  enter,
  distance,
  onHoverChange,
}: {
  place: PlaceWithRelations;
  compact?: boolean;
  /** Mise en évidence (survol du marqueur correspondant sur la carte). */
  active?: boolean;
  priority?: boolean;
  /** Fondu d'entrée (cartes ajoutées par un filtre, dans un <AnimatePresence initial={false}>). */
  enter?: boolean;
  /** Distance (m) depuis la position du visiteur (« Autour de moi »). */
  distance?: number;
  onHoverChange?: (hovered: boolean) => void;
}) {
  const { t, locale } = useI18n();
  return (
    <motion.article
      layout
      // Visible dès le rendu serveur ; seule la grille filtrée de l'explorer anime les cartes qui entrent.
      initial={enter ? { opacity: 0, y: motionTokens.distance.sm } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: motionTokens.scale.subtle, transition: exitFast }}
      transition={springs.snappy}
      whileHover={{ y: -motionTokens.distance.xs }}
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

          <div className="pointer-events-none absolute top-3.5 right-14 left-3 flex flex-wrap gap-1.5">
            {place.is_free && <Badge variant="free">{t.common.freeBadge}</Badge>}
            {place.category && <Badge variant="overlay">{place.category.name}</Badge>}
          </div>

          <div className="pointer-events-none absolute right-0 bottom-0 left-0 min-w-0 p-4 text-white">
            <h3
              lang={locale}
              className={cn(
                "font-display leading-[1.05] text-balance break-words hyphens-auto",
                compact ? "text-[1.375rem] sm:text-2xl" : "text-[1.75rem] sm:text-3xl",
              )}
            >
              {place.title}
            </h3>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/75">
              <span>{place.city}</span>
              <span className="size-0.5 rounded-full bg-white/50" />
              <span>{t.price[place.price_level]}</span>
              {distance !== undefined && (
                <>
                  <span className="size-0.5 rounded-full bg-white/50" />
                  <span className="flex items-center gap-1 whitespace-nowrap font-medium text-white">
                    <Navigation className="size-3" />
                    {t.explorer.away(formatDistance(distance, locale))}
                  </span>
                </>
              )}
              {!compact && (
                <>
                  <span className="size-0.5 rounded-full bg-white/50" />
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Clock className="size-3" />
                    {t.bestTime[place.best_time_to_visit]}
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
