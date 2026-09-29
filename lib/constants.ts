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

/** Teinte foncée de chaque catégorie : texte du badge, ombres des illustrations, titre sur fond clair. */
export const CATEGORY_INK: Record<string, string> = {
  restaurant: "#6E2A12",
  "point-de-vue": "#5C3F06",
  plage: "#174A6E",
  activite: "#5E1C3D",
  randonnee: "#1B4B31",
};

/** Fonds trop clairs pour un titre blanc (contraste insuffisant) : titre en teinte foncée. */
export const CATEGORY_LIGHT_BG = new Set(["point-de-vue"]);

export const NICE_CENTER = { lat: 43.7009, lng: 7.2683 };

/** Présentation des catégories sur l'accueil : titres explicites + accroche, dans l'ordre d'affichage. */
export const CATEGORY_SHOWCASE: { slug: string; title: string; tagline: string }[] = [
  { slug: "plage", title: "Plages & criques", tagline: "Galets, rochers et eau turquoise : là où les Niçois se baignent vraiment." },
  { slug: "point-de-vue", title: "Points de vue", tagline: "Belvédères et panoramas sur la Baie des Anges et la Riviera." },
  { slug: "restaurant", title: "Tables locales", tagline: "Socca, pissaladière et adresses où l'on parle encore nissart." },
  { slug: "randonnee", title: "Randonnées", tagline: "Sentiers du littoral et chemins muletiers qui se méritent." },
  { slug: "activite", title: "Balades & activités", tagline: "Marchés, musées et flâneries au fil de la ville." },
];
