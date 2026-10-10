/**
 * Tokens de motion du guide : toutes les transitions viennent d'ici, jamais de valeurs en dur dans un composant.
 * Sous « réduire les animations », <MotionProvider> (reducedMotion="user") coupe transforms et layout : seuls les fondus restent.
 */
export const motionTokens = {
  duration: { instant: 0.08, fast: 0.18, normal: 0.35, slow: 0.6 },
  easing: {
    smooth: [0.22, 1, 0.36, 1],
    sharp: [0.4, 0, 0.2, 1],
  },
  distance: { xs: 4, sm: 8, md: 16, lg: 24 },
  scale: { subtle: 0.98, press: 0.95, pop: 1.04 },
} as const;

export const springs = {
  /** Défaut UI : boutons, chips, pastilles de navigation. */
  snappy: { type: "spring", stiffness: 400, damping: 30 },
  /** Surfaces qui se posent : cartes, panneaux, lightbox. */
  gentle: { type: "spring", stiffness: 300, damping: 26 },
  /** Petits éléments réactifs : swap d'icône, popover. */
  instant: { type: "spring", stiffness: 600, damping: 35 },
  /** Moment ludique, avec parcimonie : le cœur des favoris. */
  bouncy: { type: "spring", stiffness: 400, damping: 10 },
  /** Mouvements lents et continus (fondu de la vidéo du hero). */
  release: { type: "spring", stiffness: 200, damping: 20, restDelta: 0.001 },
} as const;

/** Sortie plus rapide que l'entrée (~65 % de la durée). */
export const exitFast = { duration: motionTokens.duration.fast, ease: motionTokens.easing.sharp } as const;
