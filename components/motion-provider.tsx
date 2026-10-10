"use client";

import { MotionConfig } from "motion/react";
import { springs } from "@/lib/motion-tokens";

/**
 * « Réduire les animations » (réglage système) : motion coupe alors transforms et animations de layout,
 * seuls les fondus d'opacité subsistent. Ressort par défaut du guide pour toute transition non précisée.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={springs.snappy}>
      {children}
    </MotionConfig>
  );
}
