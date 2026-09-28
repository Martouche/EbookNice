import type { PlaceWithRelations } from "./types";
import { haversineKm } from "./utils";

export const DURATIONS = [
  { id: "2h", label: "2 heures", stops: 2 },
  { id: "half", label: "Demi-journée", stops: 3 },
  { id: "day", label: "Une journée", stops: 5 },
  { id: "weekend", label: "Un week-end", stops: 8 },
] as const;

export const VIBES = [
  { id: "all", label: "Un peu de tout", match: () => true },
  { id: "free", label: "100 % gratuit", match: (p: PlaceWithRelations) => p.is_free },
  { id: "sunset", label: "Apéro sunset", match: (p: PlaceWithRelations) => p.best_time_to_visit === "SUNSET" || p.tags.includes("Apéro sunset") },
  { id: "rain", label: "Jour de pluie", match: (p: PlaceWithRelations) => p.tags.includes("Jour de pluie") },
  { id: "family", label: "En famille", match: (p: PlaceWithRelations) => p.tags.includes("Famille") },
] as const;

export type DurationId = (typeof DURATIONS)[number]["id"];
export type VibeId = (typeof VIBES)[number]["id"];

/** Durée conseillée sur place, en minutes, selon la catégorie. */
const STAY_MINUTES: Record<string, number> = {
  restaurant: 75,
  "point-de-vue": 40,
  plage: 120,
  activite: 90,
  randonnee: 150,
};

const TIME_ORDER = { MORNING: 0, ANYTIME: 1, AFTERNOON: 2, SUNSET: 3, NIGHT: 4 } as const;

export interface ItineraryStop {
  place: PlaceWithRelations;
  day: number;
  start: string;
  stayMinutes: number;
  kmFromPrevious: number | null;
}

const formatTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}h${String(minutes % 60).padStart(2, "0")}`;

/**
 * Sélection sur-mesure : départ aléatoire, puis plus proche voisin (étapes groupées géographiquement),
 * et réordonnancement par moment idéal (le coucher de soleil finit la journée).
 */
export function buildItinerary(places: PlaceWithRelations[], durationId: DurationId, vibeId: VibeId): ItineraryStop[] {
  const duration = DURATIONS.find((d) => d.id === durationId) ?? DURATIONS[1];
  const vibe = VIBES.find((v) => v.id === vibeId) ?? VIBES[0];
  const candidates = places.filter(vibe.match);
  if (candidates.length === 0) return [];

  const pool = [...candidates];
  const picked = [pool.splice(Math.floor(Math.random() * pool.length), 1)[0]];
  while (picked.length < duration.stops && pool.length > 0) {
    const last = picked[picked.length - 1];
    pool.sort((a, b) => haversineKm(last, a) - haversineKm(last, b));
    // Un soupçon d'aléatoire entre les deux plus proches pour varier les propositions.
    const next = pool.length > 1 && Math.random() < 0.3 ? 1 : 0;
    picked.push(pool.splice(next, 1)[0]);
  }

  const days = durationId === "weekend" ? 2 : 1;
  const perDay = Math.ceil(picked.length / days);
  const stops: ItineraryStop[] = [];

  for (let day = 0; day < days; day++) {
    const dayPlaces = picked
      .slice(day * perDay, (day + 1) * perDay)
      .sort((a, b) => TIME_ORDER[a.best_time_to_visit] - TIME_ORDER[b.best_time_to_visit]);
    let clock = durationId === "2h" ? 17 * 60 : 9 * 60 + 30;
    dayPlaces.forEach((place, i) => {
      const previous = i > 0 ? dayPlaces[i - 1] : null;
      const km = previous ? haversineKm(previous, place) : null;
      if (km !== null) clock += Math.max(10, Math.round(km * 4)); // ~15 km/h en moyenne urbaine
      const stay = durationId === "2h" ? 45 : (STAY_MINUTES[place.category?.slug ?? ""] ?? 60);
      stops.push({ place, day: day + 1, start: formatTime(clock), stayMinutes: stay, kmFromPrevious: km });
      clock += stay;
    });
  }

  return stops;
}
