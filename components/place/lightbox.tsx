"use client";

import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { BLUR_DATA_URL } from "@/lib/image";

interface LightboxProps {
  images: string[];
  title: string;
  /** Index ouvert, `null` = fermée. */
  openAt: number | null;
  onClose: () => void;
}

/** Galerie plein écran : swipe (Embla), flèches clavier, Échap pour fermer. */
const noopSubscribe = () => () => {};

export function Lightbox({ images, title, openAt, onClose }: LightboxProps) {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {openAt !== null && <LightboxContent images={images} title={title} startIndex={openAt} onClose={onClose} />}
    </AnimatePresence>,
    document.body,
  );
}

function LightboxContent({ images, title, startIndex, onClose }: { images: string[]; title: string; startIndex: number; onClose: () => void }) {
  const [emblaRef, embla] = useEmblaCarousel({ startIndex, loop: images.length > 1 });
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") embla?.scrollNext();
      if (e.key === "ArrowLeft") embla?.scrollPrev();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [embla, onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Photos — ${title}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className="fixed inset-0 z-[60] flex flex-col bg-black text-white"
    >
      <div className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <span className="font-mono text-xs tracking-[0.18em] text-white/70">
          {index + 1} / {images.length}
        </span>
        <p className="mx-4 truncate font-display text-lg">{title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la galerie"
          className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors duration-100 hover:bg-white/20"
        >
          <X className="size-5" />
        </button>
      </div>

      <div ref={emblaRef} className="min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full touch-pan-y">
          {images.map((src, i) => (
            <div key={src} className="relative h-full min-w-0 flex-[0_0_100%]">
              <Image
                src={src}
                alt={`${title} — photo ${i + 1}`}
                fill
                sizes="100vw"
                quality={90}
                priority={i === startIndex}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex items-center justify-center gap-3 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => embla?.scrollPrev()}
            aria-label="Photo précédente"
            className="grid size-11 place-items-center rounded-full bg-white/10 transition-colors duration-100 hover:bg-white/20"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="no-scrollbar flex max-w-[60vw] gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Photo ${i + 1}`}
                onClick={() => embla?.scrollTo(i)}
                className={`relative size-12 shrink-0 overflow-hidden rounded-lg transition-opacity duration-100 ${i === index ? "opacity-100 ring-2 ring-white" : "opacity-50 hover:opacity-80"}`}
              >
                <Image src={src} alt="" fill sizes="48px" className="object-cover" />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => embla?.scrollNext()}
            aria-label="Photo suivante"
            className="grid size-11 place-items-center rounded-full bg-white/10 transition-colors duration-100 hover:bg-white/20"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
