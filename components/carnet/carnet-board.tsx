"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { FavoriteButton } from "@/components/favorite-button";
import { PlaceCover } from "@/components/place-cover";
import { priceLabel } from "@/lib/constants";
import type { PlaceWithRelations } from "@/lib/types";
import { cn } from "@/lib/utils";

const PlacesMap = dynamic(() => import("@/components/map/places-map").then((m) => m.PlacesMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

/** Carte personnalisée + liste synchronisée (favoris ou itinéraire). */
export function CarnetBoard({
  places,
  route,
  editable,
}: {
  places: PlaceWithRelations[];
  route?: boolean;
  editable?: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="no-print h-72 overflow-hidden rounded-[2rem] border border-line lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:h-[calc(100dvh-var(--header-h)-4rem)]">
        <PlacesMap places={places} selectedId={selectedId} onSelect={setSelectedId} route={route} geolocate />
      </div>

      <ol className="space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {places.map((place, i) => (
            <motion.li
              key={place.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onMouseEnter={() => setSelectedId(place.id)}
              className={cn(
                "relative flex items-stretch gap-4 rounded-3xl border bg-card p-3 transition-colors duration-100 break-inside-avoid",
                selectedId === place.id ? "border-ocre" : "border-line",
              )}
            >
              <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-2xl md:w-28">
                <PlaceCover src={place.images[0]} title={place.title} category={place.category} sizes="112px" />
                {route && (
                  <span className="absolute top-2 left-2 grid size-6 place-items-center rounded-full bg-black/60 font-mono text-[11px] text-white">
                    {i + 1}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 py-1">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CategoryIcon icon={place.category?.icon} className="size-3.5" />
                  {place.category?.name} · {place.city} · {priceLabel(place.price_level)}
                </p>
                <Link href={`/lieux/${place.slug}`} className="mt-1 block font-display text-2xl leading-tight hover:underline">
                  {place.title}
                </Link>
                {place.local_tip && (
                  <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-muted-foreground italic">« {place.local_tip} »</p>
                )}
              </div>
              {editable && <FavoriteButton placeId={place.id} className="no-print shrink-0 self-start" />}
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </div>
  );
}
