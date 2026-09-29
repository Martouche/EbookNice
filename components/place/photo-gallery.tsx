"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Grid2x2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PlaceCover } from "@/components/place-cover";
import { BLUR_DATA_URL } from "@/lib/image";
import type { Category, ImageCredit } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Lightbox } from "./lightbox";
import { PhotoCredits } from "./photo-credit";

interface PhotoGalleryProps {
  images: string[];
  title: string;
  credits?: ImageCredit[] | null;
  category: Category | null;
  /** Éléments superposés (favori, partage) en haut à droite. */
  actions?: React.ReactNode;
}

/** Photo-first : carrousel plein cadre sur mobile, mosaïque bento sur desktop, lightbox au clic. */
export function PhotoGallery({ images, title, credits, category, actions }: PhotoGalleryProps) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [emblaRef, embla] = useEmblaCarousel({ loop: images.length > 1 });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  if (images.length === 0) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[21/9]">
        <PlaceCover title={title} category={category} />
        <div className="absolute top-4 right-4 flex gap-2">{actions}</div>
      </div>
    );
  }

  const tiles = images.slice(0, 5);

  return (
    <>
      {/* Mobile */}
      <div className="relative -mx-4 md:hidden">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex touch-pan-y">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setOpenAt(i)}
                aria-label={`Agrandir la photo ${i + 1}`}
                className="relative aspect-[4/5] min-w-0 flex-[0_0_100%]"
              >
                <Image
                  src={src}
                  alt={`${title} — photo ${i + 1}`}
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
        {images.length > 1 && (
          <span className="pointer-events-none absolute right-4 bottom-4 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur">
            {index + 1} / {images.length}
          </span>
        )}
        <div className="absolute top-4 right-4 flex gap-2">{actions}</div>
      </div>

      {/* Desktop : mosaïque bento */}
      <div
        className={cn(
          "relative hidden h-[min(34rem,62vh)] gap-2 overflow-hidden rounded-[2rem] md:grid",
          tiles.length === 1 && "grid-cols-1",
          tiles.length === 2 && "grid-cols-2",
          tiles.length >= 3 && "grid-cols-4 grid-rows-2",
        )}
      >
        {tiles.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpenAt(i)}
            aria-label={`Agrandir la photo ${i + 1}`}
            className={cn(
              "group relative overflow-hidden bg-muted",
              tiles.length >= 3 && i === 0 && "col-span-2 row-span-2",
              tiles.length === 3 && i > 0 && "col-span-2",
              tiles.length === 4 && i === 3 && "col-span-2",
            )}
          >
            <Image
              src={src}
              alt={`${title} — photo ${i + 1}`}
              fill
              sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "25vw"}
              priority={i === 0}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover transition-[transform,filter] duration-300 ease-out group-hover:scale-[1.02] group-hover:brightness-90"
            />
          </button>
        ))}
        <div className="absolute top-4 right-4 flex gap-2">{actions}</div>
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => setOpenAt(0)}
            className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#14120f] transition-transform duration-100 active:scale-95"
          >
            <Grid2x2 className="size-4" />
            Voir les {images.length} photos
          </button>
        )}
      </div>

      <PhotoCredits images={images} credits={credits} />
      <Lightbox images={images} title={title} credits={credits} openAt={openAt} onClose={() => setOpenAt(null)} />
    </>
  );
}
