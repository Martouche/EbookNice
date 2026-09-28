"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, Map as MapIcon, Search, SlidersHorizontal, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { PlaceCard } from "@/components/place-card";
import { EmptyState } from "@/components/section-heading";
import { Chip } from "@/components/ui/chip";
import { Segmented } from "@/components/ui/segmented";
import { PRICE_LABELS } from "@/lib/constants";
import type { Category, PlaceWithRelations } from "@/lib/types";
import { cn } from "@/lib/utils";

const PlacesMap = dynamic(() => import("@/components/map/places-map").then((m) => m.PlacesMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

export interface ExplorerFilters {
  q: string;
  free: boolean;
  categories: string[];
  prices: number[];
  tags: string[];
}

type View = "liste" | "carte";

function toSearchParams(filters: ExplorerFilters, view: View) {
  const params = new URLSearchParams();
  if (view === "carte") params.set("vue", "carte");
  if (filters.q) params.set("q", filters.q);
  if (filters.free) params.set("gratuit", "1");
  if (filters.categories.length) params.set("categorie", filters.categories.join(","));
  if (filters.prices.length) params.set("prix", filters.prices.join(","));
  if (filters.tags.length) params.set("tags", filters.tags.join(","));
  return params.toString();
}

const toggleIn = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

export function Explorer({
  places,
  categories,
  initialFilters,
  initialView,
}: {
  places: PlaceWithRelations[];
  categories: Category[];
  initialFilters: ExplorerFilters;
  initialView: View;
}) {
  const [filters, setFilters] = useState(initialFilters);
  const [view, setView] = useState<View>(initialView);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(initialFilters.prices.length > 0 || initialFilters.tags.length > 0);
  const railRef = useRef<HTMLDivElement>(null);

  const allTags = useMemo(() => [...new Set(places.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b, "fr")), [places]);

  const results = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return places.filter((p) => {
      if (filters.free && !p.is_free) return false;
      if (filters.categories.length && !filters.categories.includes(p.category?.slug ?? "")) return false;
      if (filters.prices.length && !filters.prices.includes(p.price_level)) return false;
      if (filters.tags.length && !filters.tags.every((t) => p.tags.includes(t))) return false;
      if (q && !`${p.title} ${p.city} ${p.description ?? ""} ${p.tags.join(" ")}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [places, filters]);

  // URL partageable, sans relancer le rendu serveur.
  useEffect(() => {
    const qs = toSearchParams(filters, view);
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [filters, view]);

  const activeCount = (filters.free ? 1 : 0) + filters.categories.length + filters.prices.length + filters.tags.length;

  const select = useCallback((id: string) => {
    setSelectedId(id);
    railRef.current
      ?.querySelector(`[data-place-id="${id}"]`)
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  return (
    <div className={cn(view === "carte" && "md:flex md:h-[calc(100dvh-4rem)] md:flex-col")}>
      {/* Barre de filtres */}
      <div className="sticky top-14 z-30 border-b border-line bg-glass backdrop-blur-2xl md:top-16">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-3 md:px-8">
          <div className="flex items-center gap-2">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder="Socca, crique, belvédère…"
                aria-label="Rechercher"
                className="h-10 w-full rounded-full border border-line bg-card pr-4 pl-10 text-sm placeholder:text-muted-foreground focus-visible:border-ocre/60 focus-visible:outline-none"
              />
            </label>
            <Segmented
              id="explorer-view"
              value={view}
              onChange={setView}
              options={[
                { value: "liste", label: <><LayoutGrid /><span className="hidden sm:inline">Liste</span></> },
                { value: "carte", label: <><MapIcon /><span className="hidden sm:inline">Carte</span></> },
              ]}
            />
          </div>

          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
            <Chip
              active={filters.free}
              onClick={() => setFilters((f) => ({ ...f, free: !f.free }))}
              className={cn(filters.free ? "border-emerald-500 bg-emerald-500 text-white" : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400")}
            >
              Gratuit · FREE
            </Chip>
            <span className="my-auto h-5 w-px shrink-0 bg-line" />
            {categories.map((c) => (
              <Chip
                key={c.id}
                active={filters.categories.includes(c.slug)}
                onClick={() => setFilters((f) => ({ ...f, categories: toggleIn(f.categories, c.slug) }))}
              >
                <CategoryIcon icon={c.icon} />
                {c.name}
              </Chip>
            ))}
            <span className="my-auto h-5 w-px shrink-0 bg-line" />
            <Chip active={showMore} onClick={() => setShowMore((s) => !s)}>
              <SlidersHorizontal />
              Plus de filtres
            </Chip>
            {activeCount > 0 && (
              <Chip onClick={() => setFilters({ q: filters.q, free: false, categories: [], prices: [], tags: [] })}>
                <X />
                Effacer ({activeCount})
              </Chip>
            )}
          </div>

          <AnimatePresence initial={false}>
            {showMore && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pb-1">
                  <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
                    <span className="w-12 shrink-0 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Prix</span>
                    {PRICE_LABELS.map((label, level) => (
                      <Chip
                        key={label}
                        active={filters.prices.includes(level)}
                        onClick={() => setFilters((f) => ({ ...f, prices: toggleIn(f.prices, level) }))}
                      >
                        {level === 0 ? "0 €" : label}
                      </Chip>
                    ))}
                  </div>
                  <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
                    <span className="w-12 shrink-0 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Envie</span>
                    {allTags.map((tag) => (
                      <Chip
                        key={tag}
                        active={filters.tags.includes(tag)}
                        onClick={() => setFilters((f) => ({ ...f, tags: toggleIn(f.tags, tag) }))}
                      >
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {view === "liste" ? (
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <p className="mb-6 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            {results.length} adresse{results.length > 1 ? "s" : ""}
          </p>
          {results.length === 0 ? (
            <EmptyState>Aucune adresse ne correspond. Essayez d&apos;assouplir un filtre.</EmptyState>
          ) : (
            <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {results.map((place, i) => (
                  <PlaceCard key={place.id} place={place} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="relative h-[calc(100dvh-14rem)] md:h-auto md:flex-1">
          <PlacesMap places={results} selectedId={selectedId} onSelect={select} />
          <div
            ref={railRef}
            className="no-scrollbar absolute inset-x-0 bottom-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:bottom-6 md:px-8"
          >
            {results.map((place) => (
              <div key={place.id} data-place-id={place.id} className="w-64 shrink-0 snap-center md:w-72">
                <PlaceCard place={place} compact selected={place.id === selectedId} onSelect={() => setSelectedId(place.id)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
