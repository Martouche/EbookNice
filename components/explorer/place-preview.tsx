"use client";

import { ArrowUpRight, Clock, Navigation } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { FavoriteButton } from "@/components/favorite-button";
import { PlaceImages } from "@/components/place-images";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BEST_TIME_LABELS, priceLabel } from "@/lib/constants";
import type { PlaceWithRelations } from "@/lib/types";

/** Contenu de prévisualisation d'un spot : bottom sheet mobile et carte flottante desktop. */
export function PlacePreview({ place, titleAs: Title = "h3" }: { place: PlaceWithRelations; titleAs?: "h2" | "h3" }) {
  return (
    <div>
      <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl">
        <PlaceImages images={place.images} title={place.title} category={place.category} sizes="(min-width: 768px) 360px, 100vw" />
        <div className="pointer-events-none absolute top-3.5 left-3 flex gap-1.5">
          {place.is_free ? <Badge variant="free">Gratuit · FREE</Badge> : <Badge variant="glass">{priceLabel(place.price_level)}</Badge>}
        </div>
        <FavoriteButton placeId={place.id} className="absolute top-3 right-3 z-10" />
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <CategoryIcon icon={place.category?.icon} className="size-3.5 text-ocre" />
        {place.category?.name}
        <span className="size-0.5 rounded-full bg-muted-foreground" />
        {place.city}
        <span className="size-0.5 rounded-full bg-muted-foreground" />
        <Clock className="size-3.5" />
        {BEST_TIME_LABELS[place.best_time_to_visit]}
      </div>
      <Title className="mt-1.5 font-display text-3xl leading-tight">{place.title}</Title>
      {place.local_tip && (
        <p className="mt-2 line-clamp-2 text-sm leading-snug text-muted-foreground italic">« {place.local_tip} »</p>
      )}

      <div className="mt-5 flex gap-2">
        <Button asChild variant="accent" className="flex-1">
          <Link href={`/lieux/${place.slug}`}>
            Voir la fiche
            <ArrowUpRight />
          </Link>
        </Button>
        <Button asChild variant="outline" size="icon" aria-label="Itinéraire Google Maps">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Navigation />
          </a>
        </Button>
      </div>
    </div>
  );
}
