"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { BLUR_DATA_URL } from "@/lib/image";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PlaceCover } from "./place-cover";

/**
 * Visuels d'une carte. Pas de swipe interne : le glissement horizontal reste réservé au défilement
 * des cartes. Changement de photo par zones de tap gauche/droite (type Stories) et flèches visibles ;
 * le tap au centre ouvre la fiche (lien parent).
 */
export function PlaceImages({
  images,
  title,
  category,
  sizes,
  priority,
}: {
  images: string[];
  title: string;
  category: Category | null;
  sizes?: string;
  priority?: boolean;
}) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, watchDrag: false });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  const go = useCallback(
    (e: MouseEvent, dir: -1 | 1) => {
      e.preventDefault();
      e.stopPropagation();
      if (dir === 1) embla?.scrollNext();
      else embla?.scrollPrev();
    },
    [embla],
  );

  if (images.length <= 1) {
    return (
      <PlaceCover
        src={images[0]}
        title={title}
        category={category}
        sizes={sizes}
        priority={priority}
        className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
    );
  }

  return (
    <div className="group/images absolute inset-0">
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {images.map((src, i) => (
            <div key={src} className="relative h-full min-w-0 flex-[0_0_100%]">
              <Image
                src={src}
                alt={`${title} — photo ${i + 1}`}
                fill
                sizes={sizes}
                priority={priority && i === 0}
                loading={i === 0 ? undefined : "lazy"}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-3 top-1.5 z-10 flex gap-1">
        {images.map((src, i) => (
          <span
            key={src}
            className={cn("h-[3px] flex-1 rounded-full transition-colors duration-150", i === index ? "bg-white" : "bg-white/35")}
          />
        ))}
      </div>

      {/* Zones de tap (bas de la photo, sous les badges / le cœur) : 30 % à gauche, 30 % à droite. */}
      {[
        { dir: -1 as const, Icon: ChevronLeft, zone: "left-0", arrow: "left-2", label: "Photo précédente" },
        { dir: 1 as const, Icon: ChevronRight, zone: "right-0", arrow: "right-2", label: "Photo suivante" },
      ].map(({ dir, Icon, zone, arrow, label }) => (
        <button
          key={dir}
          type="button"
          aria-label={label}
          onClick={(e) => go(e, dir)}
          className={cn("absolute top-14 bottom-24 z-10 w-[30%] cursor-pointer", zone)}
        >
          <span
            className={cn(
              "absolute top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-opacity duration-150 md:bg-white/90 md:text-[#14120f] md:opacity-0 md:group-hover/images:opacity-100",
              arrow,
            )}
          >
            <Icon className="size-4" />
          </span>
        </button>
      ))}
    </div>
  );
}
