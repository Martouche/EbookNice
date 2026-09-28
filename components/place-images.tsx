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
 * Visuels d'une carte : carrousel Embla si plusieurs photos (swipe mobile, flèches au survol desktop),
 * sinon couverture simple. Embla neutralise le clic après un glissement : le lien parent reste sûr.
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
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
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
        <div className="flex h-full touch-pan-y">
          {images.map((src, i) => (
            <div key={src} className="relative h-full min-w-0 flex-[0_0_100%]">
              <Image
                src={src}
                alt={`${title} — photo ${i + 1}`}
                fill
                sizes={sizes}
                priority={priority && i === 0}
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
          <span key={src} className={cn("h-0.5 flex-1 rounded-full", i === index ? "bg-white" : "bg-white/35")} />
        ))}
      </div>

      {[
        { dir: -1 as const, Icon: ChevronLeft, side: "left-2", label: "Photo précédente" },
        { dir: 1 as const, Icon: ChevronRight, side: "right-2", label: "Photo suivante" },
      ].map(({ dir, Icon, side, label }) => (
        <button
          key={dir}
          type="button"
          aria-label={label}
          onClick={(e) => go(e, dir)}
          className={cn(
            "absolute top-1/2 z-10 hidden size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#14120f] opacity-0 transition-opacity duration-150 group-hover/images:opacity-100 md:grid",
            side,
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}
