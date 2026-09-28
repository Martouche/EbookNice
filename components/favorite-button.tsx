"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "./favorites-provider";

export function FavoriteButton({ placeId, className }: { placeId: string; className?: string }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(placeId);

  return (
    <motion.button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Retirer du carnet" : "Ajouter au carnet"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(placeId);
      }}
      whileTap={{ scale: 0.82 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "relative grid size-9 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md",
        className,
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={active ? "on" : "off"}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          <Heart className={cn("size-4", active && "fill-terracotta stroke-terracotta")} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
