"use client";

import { AnimatePresence, motion } from "motion/react";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { useFavorites } from "./favorites-provider";
import { springs } from "@/lib/motion-tokens";

const PARTICLES = Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2);

export function FavoriteButton({
  placeId,
  className,
  variant = "overlay",
}: {
  placeId: string;
  className?: string;
  /** `overlay` sur photo, `solid` sur fond uni (fiche, drawer). */
  variant?: "overlay" | "solid";
}) {
  const { isFavorite, toggle, isAuthed } = useFavorites();
  const { t } = useI18n();
  const active = isFavorite(placeId);
  const [burst, setBurst] = useState(0);

  return (
    <motion.button
      type="button"
      aria-pressed={active}
      aria-label={active ? t.card.removeFavorite : t.card.addFavorite}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!active && isAuthed) setBurst((b) => b + 1);
        toggle(placeId);
      }}
      whileTap={{ scale: 0.8 }}
      transition={springs.instant}
      className={cn(
        "relative grid size-9 place-items-center rounded-full after:absolute after:-inset-2 after:content-['']",
        variant === "overlay"
          ? "border border-white/15 bg-scrim text-white"
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
              transition={springs.gentle}
            />
          ))}
      </AnimatePresence>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={active ? "on" : "off"}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.3, opacity: 0 }}
          transition={springs.bouncy}
        >
          <Heart className={cn("size-4", active && "fill-terracotta stroke-terracotta")} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
