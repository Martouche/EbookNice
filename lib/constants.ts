import type { BestTime } from "./types";

export const PRICE_LABELS = ["Gratuit", "€", "€€", "€€€", "€€€€"] as const;

export function priceLabel(level: number) {
  return PRICE_LABELS[level] ?? "—";
}

export const BEST_TIME_LABELS: Record<BestTime, string> = {
  SUNSET: "Au coucher du soleil",
  MORNING: "Le matin",
  AFTERNOON: "L'après-midi",
  NIGHT: "Le soir",
  ANYTIME: "À toute heure",
};

export const SUGGESTED_TAGS = [
  "Vue mer",
  "Apéro sunset",
  "Jour de pluie",
  "Famille",
  "Baignade",
  "PMR",
  "Chiens admis",
  "Ombragé",
];

/** Teinte de marque par catégorie (slug) — utilisée pour les marqueurs et pastilles. */
export const CATEGORY_COLORS: Record<string, string> = {
  restaurant: "#D9653B",
  "point-de-vue": "#E3B341",
  plage: "#3A9BDC",
  activite: "#C9508A",
  randonnee: "#3F9B6B",
};

export const DEFAULT_CATEGORY_COLOR = "#8A8578";

export const NICE_CENTER = { lat: 43.7009, lng: 7.2683 };
