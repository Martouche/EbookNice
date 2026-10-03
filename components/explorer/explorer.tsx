"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { PlaceCard } from "@/components/place-card";
import { EmptyState } from "@/components/section-heading";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { filterPlaces, serializeFilters, type ExplorerFilters, type ExplorerView } from "@/lib/filters";
import type { Category, PlaceWithRelations } from "@/lib/types";
import { useIsDesktop } from "@/lib/use-media-query";
import { FilterBar } from "./filter-bar";
import { PlacePreview } from "./place-preview";

const PlacesMap = dynamic(() => import("@/components/map/places-map").then((m) => m.PlacesMap), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

const spring = { type: "spring", stiffness: 400, damping: 30 } as const;

export function Explorer({
  places,
  categories,
  initialFilters,
  initialView,
}: {
  places: PlaceWithRelations[];
  categories: Category[];
  initialFilters: ExplorerFilters;
  initialView: ExplorerView;
}) {
  const isDesktop = useIsDesktop();
  const [filters, setFilters] = useState(initialFilters);
  const [view, setView] = useState(initialView);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const asideRef = useRef<HTMLDivElement>(null);

  // La frappe reste fluide même avec beaucoup de spots : le filtrage suit en différé.
  const deferredFilters = useDeferredValue(filters);
  const results = useMemo(() => filterPlaces(places, deferredFilters), [places, deferredFilters]);
  const tags = useMemo(() => [...new Set(places.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b, "fr")), [places]);
  const selected = results.find((p) => p.id === selectedId) ?? null;

  // URL partageable (`?category=plage&price=free`) sans relancer le rendu serveur.
  useEffect(() => {
    const qs = serializeFilters(filters, view);
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [filters, view]);

  const selectFromMap = (id: string | null) => {
    setSelectedId(id);
    if (id && isDesktop) {
      asideRef.current?.querySelector(`[data-place-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const filterBar = (className?: string) => (
    <FilterBar
      filters={filters}
      setFilters={setFilters}
      view={view}
      setView={(v) => {
        setView(v);
        setSelectedId(null);
      }}
      categories={categories}
      tags={tags}
      resultCount={results.length}
      className={className}
    />
  );

  if (view === "list") {
    return (
      <>
        {filterBar("sticky top-[var(--header-h)]")}
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
                  <PlaceCard key={place.id} place={place} index={i} priority={i < 3} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </>
    );
  }

  return (
    // Hauteur en dvh : pas de saut quand la barre d'adresse iOS/Android se replie.
    <div className="relative -mb-24 flex h-[calc(100dvh-var(--header-h))] flex-col md:mb-0">
      {filterBar("absolute inset-x-0 top-0 md:relative")}

      <div className="relative min-h-0 flex-1 md:flex">
        {/* Desktop : liste synchronisée au survol avec les marqueurs */}
        {isDesktop && (
          <aside ref={asideRef} className="no-scrollbar w-[380px] shrink-0 space-y-3 overflow-y-auto border-r border-line p-4 lg:w-[420px]">
            <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              {results.length} adresse{results.length > 1 ? "s" : ""} sur la carte
            </p>
            {results.length === 0 && <EmptyState>Aucune adresse ne correspond.</EmptyState>}
            {results.map((place) => (
              <div key={place.id} data-place-id={place.id}>
                <PlaceCard
                  place={place}
                  compact
                  active={place.id === hoveredId || place.id === selectedId}
                  onHoverChange={(h) => setHoveredId(h ? place.id : null)}
                />
              </div>
            ))}
          </aside>
        )}

        <div className="relative h-full flex-1">
          <PlacesMap
            places={results}
            selectedId={selectedId}
            onSelect={selectFromMap}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            padding={isDesktop ? { top: 48, bottom: 48 } : { top: 140, bottom: 110 }}
            focusOffsetY={isDesktop ? 0 : 140}
            geolocate
            controls={isDesktop ? "top-right" : "bottom-right"}
            className="map-above-nav"
          />


          {/* Desktop : carte de prévisualisation flottante */}
          <AnimatePresence>
            {isDesktop && selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={spring}
                className="absolute right-6 bottom-6 w-[360px] rounded-[1.75rem] border border-line bg-background/95 p-4 backdrop-blur-xl"
              >
                <button
                  type="button"
                  aria-label="Fermer l'aperçu"
                  onClick={() => setSelectedId(null)}
                  className="absolute -top-3 -right-3 z-10 grid size-8 place-items-center rounded-full border border-line bg-background text-muted-foreground transition-colors duration-100 hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
                <PlacePreview place={selected} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile : bottom sheet au tap sur un marqueur */}
      {!isDesktop && (
        <Drawer open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
          <DrawerContent>
            <div className="px-4 pt-2 pb-6">
              {selected && (
                <>
                  <DrawerTitle className="sr-only">{selected.title}</DrawerTitle>
                  <PlacePreview place={selected} titleAs="h2" />
                </>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
