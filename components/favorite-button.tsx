"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useFavorites } from "./favorites-provider";

const PARTICLES = Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2);

export function FavoriteButton({
  placeId,
  className,
  variant = "glass",
}: {
  placeId: string;
  className?: string;
  /** `glass` sur photo, `solid` sur fond uni (fiche, drawer). */
  variant?: "glass" | "solid";
}) {
  const { isFavorite, toggle, isAuthed } = useFavorites();
  const active = isFavorite(placeId);
  const [burst, setBurst] = useState(0);

  return (
    <motion.button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Retirer du carnet" : "Ajouter au carnet"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!active && isAuthed) setBurst((b) => b + 1);
        toggle(placeId);
      }}
      whileTap={{ scale: 0.8 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "relative grid size-9 place-items-center rounded-full after:absolute after:-inset-2 after:content-['']",
        variant === "glass"
          ? "border border-white/15 bg-black/40 text-white backdrop-blur-md"
          : "border border-line-strong bg-card text-foreground",
        className,
      )}
    >
      <AnimatePresence>
        {burst > 0 &&
          PARTICLES.map((angle) => (
            <motion.span
              key={`${burst}-${angle}`}
              aria-hidden
              className="pointer-events-none absolute size-1.5 rounded-full bg-terracotta"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: Math.cos(angle) * 20, y: Math.sin(angle) * 20, opacity: 0, scale: 0.4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          ))}
      </AnimatePresence>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={active ? "on" : "off"}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.3, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
        >
          <Heart className={cn("size-4", active && "fill-terracotta stroke-terracotta")} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
