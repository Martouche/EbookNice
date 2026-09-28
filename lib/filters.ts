import type { PlaceWithRelations } from "./types";

/** Filtres de l'explorer, sérialisés dans l'URL : `?category=plage,restaurant&price=free,2&tags=Famille&q=socca&view=map`. */
export interface ExplorerFilters {
  q: string;
  categories: string[];
  /** Niveaux de prix ; 0 = Gratuit / FREE (`price=free` dans l'URL). */
  prices: number[];
  tags: string[];
}

export type ExplorerView = "list" | "map";

type RawParams = Record<string, string | string[] | undefined>;

const list = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value.join(",") : (value ?? "")).split(",").map((v) => v.trim()).filter(Boolean);

export function parseFilters(params: RawParams): { filters: ExplorerFilters; view: ExplorerView } {
  const prices = list(params.price)
    .map((p) => (p === "free" ? 0 : Number(p)))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 4);
  return {
    view: params.view === "map" ? "map" : "list",
    filters: {
      q: typeof params.q === "string" ? params.q : "",
      categories: list(params.category),
      prices: [...new Set(prices)],
      tags: list(params.tags),
    },
  };
}

export function serializeFilters(filters: ExplorerFilters, view: ExplorerView) {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.categories.length) params.set("category", filters.categories.join(","));
  if (filters.prices.length) params.set("price", filters.prices.map((p) => (p === 0 ? "free" : p)).join(","));
  if (filters.tags.length) params.set("tags", filters.tags.join(","));
  if (view === "map") params.set("view", "map");
  // Virgules lisibles dans l'URL partagée.
  return params.toString().replace(/%2C/g, ",");
}

/** Minuscule + sans accents : « cascade » trouve « Cascade », « nicois » trouve « Niçois ». */
const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function filterPlaces(places: PlaceWithRelations[], filters: ExplorerFilters) {
  const terms = normalize(filters.q).split(/\s+/).filter(Boolean);
  return places.filter((p) => {
    if (filters.categories.length && !filters.categories.includes(p.category?.slug ?? "")) return false;
    if (filters.prices.length && !filters.prices.includes(p.price_level)) return false;
    if (filters.tags.length && !filters.tags.every((t) => p.tags.includes(t))) return false;
    if (terms.length) {
      const haystack = normalize(
        [p.title, p.city, p.address, p.description, p.local_tip, p.category?.name, p.chapter?.title, ...p.tags]
          .filter(Boolean)
          .join(" "),
      );
      // « sunset » doit aussi trouver les spots au coucher de soleil.
      const extra = p.best_time_to_visit === "SUNSET" ? " sunset coucher soleil" : "";
      if (!terms.every((t) => (haystack + extra).includes(t))) return false;
    }
    return true;
  });
}
