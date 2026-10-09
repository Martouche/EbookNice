"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { distanceMeters } from "@/lib/geo";
import { PlaceCard } from "@/components/place-card";
import { EmptyState } from "@/components/section-heading";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { filterPlaces, serializeFilters, type ExplorerFilters, type ExplorerView } from "@/lib/filters";
import { useI18n } from "@/lib/i18n/client";
import { tagLabel } from "@/lib/i18n/dictionaries";
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
  const { t, locale } = useI18n();
  const [filters, setFilters] = useState(initialFilters);
  const [view, setView] = useState(initialView);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const asideRef = useRef<HTMLDivElement>(null);
  // « Autour de moi » : position lue une fois (elle reste dans le navigateur), puis tri par distance.
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(false);

  const toggleNearMe = () => {
    if (origin) return setOrigin(null);
    if (!("geolocation" in navigator)) return setGeoError(true);
    setLocating(true);
    setGeoError(false);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setOrigin({ lat: coords.latitude, lng: coords.longitude });
        setLocating(false);
      },
      () => {
        setGeoError(true);
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  // La frappe reste fluide même avec beaucoup de spots : le filtrage suit en différé.
  const deferredFilters = useDeferredValue(filters);
  // Les tags sont stockés en français : on cherche aussi dans leur traduction (« sea view », « rainy day »…).
  const distances = useMemo(
    () => (origin ? new Map(places.map((p) => [p.id, distanceMeters(origin, p)])) : null),
    [places, origin],
  );
  const results = useMemo(() => {
    const filtered = filterPlaces(places, deferredFilters, (p) => p.tags.map((tag) => tagLabel(t, tag)).join(" "));
    return distances ? filtered.sort((a, b) => distances.get(a.id)! - distances.get(b.id)!) : filtered;
  }, [places, deferredFilters, t, distances]);
  const tags = useMemo(
    () => [...new Set(places.flatMap((p) => p.tags))].sort((a, b) => tagLabel(t, a).localeCompare(tagLabel(t, b), locale)),
    [places, t, locale],
  );
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
      nearMe={{ active: !!origin, locating, toggle: toggleNearMe }}
      className={className}
    />
  );

  if (view === "list") {
    return (
      <>
        {filterBar("sticky top-[var(--header-h)]")}
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <p className="mb-6 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            {t.common.places(results.length)}
          </p>
          {geoError && <p role="alert" className="-mt-3 mb-6 text-sm text-red-500">{t.explorer.locationDenied}</p>}
          {results.length === 0 ? (
            <EmptyState>{t.explorer.noResults}</EmptyState>
          ) : (
            <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {results.map((place, i) => (
                  <PlaceCard key={place.id} place={place} index={i} priority={i < 3} distance={distances?.get(place.id)} />
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
              {t.explorer.onMap(results.length)}
            </p>
            {results.length === 0 && <EmptyState>{t.explorer.noResultsShort}</EmptyState>}
            {results.map((place) => (
              <div key={place.id} data-place-id={place.id}>
                <PlaceCard
                  place={place}
                  compact
                  distance={distances?.get(place.id)}
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
            cluster
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
                  aria-label={t.explorer.closePreview}
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
