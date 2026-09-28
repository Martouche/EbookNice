"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { PlaceCover } from "@/components/place-cover";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const SWIPE_THRESHOLD = 60;

export function PhotoCarousel({ images, title, category }: { images: string[]; title: string; category: Category | null }) {
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);

  if (images.length === 0) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] md:aspect-[4/3]">
        <PlaceCover title={title} category={category} />
      </div>
    );
  }

  const paginate = (dir: number) => setState(([i]) => [(i + dir + images.length) % images.length, dir]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) paginate(1);
    else if (info.offset.x > SWIPE_THRESHOLD) paginate(-1);
  };

  return (
    <div className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-muted md:aspect-[4/3]">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          initial={{ x: direction >= 0 ? "100%" : "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: direction >= 0 ? "-100%" : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          drag={images.length > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={onDragEnd}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <Image
            src={images[index]}
            alt={`${title} — photo ${index + 1}`}
            fill
            priority={index === 0}
            sizes="(min-width: 768px) 60vw, 100vw"
            className="pointer-events-none object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <>
          {[
            { dir: -1, Icon: ChevronLeft, side: "left-3", label: "Photo précédente" },
            { dir: 1, Icon: ChevronRight, side: "right-3", label: "Photo suivante" },
          ].map(({ dir, Icon, side, label }) => (
            <button
              key={dir}
              type="button"
              aria-label={label}
              onClick={() => paginate(dir)}
              className={cn(
                "absolute top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 text-white opacity-0 backdrop-blur-md transition-opacity duration-150 group-hover:opacity-100 md:grid",
                side,
              )}
            >
              <Icon className="size-5" />
            </button>
          ))}
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Photo ${i + 1}`}
                onClick={() => setState([i, i > index ? 1 : -1])}
                className="relative h-1.5 w-1.5 overflow-hidden rounded-full bg-white/40"
              >
                {i === index && (
                  <motion.span
                    layoutId="carousel-dot"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
