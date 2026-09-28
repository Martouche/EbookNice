"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoJSONSource, Marker } from "maplibre-gl";
import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/constants";
import type { PlaceWithRelations } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MarkerPin } from "./marker-pin";
import { useMaplibre } from "./use-maplibre";

export type MapPlace = Pick<PlaceWithRelations, "id" | "title" | "lat" | "lng" | "category">;

interface PlacesMapProps {
  places: MapPlace[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  /** Survol synchronisé avec la liste (desktop). */
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
  /** Numéros d'étape à la place des icônes + tracé pointillé (itinéraires). */
  route?: boolean;
  /** Marge de cadrage (px) — ex. panneau latéral ou barre de filtres superposés. */
  padding?: { top?: number; bottom?: number; left?: number; right?: number };
  /** Décalage vertical (px) du lieu sélectionné, pour le garder visible au-dessus d'un drawer. */
  focusOffsetY?: number;
  className?: string;
}

const ROUTE_ID = "guide-route";

export function PlacesMap({
  places,
  selectedId,
  onSelect,
  hoveredId,
  onHover,
  route,
  padding,
  focusOffsetY = 0,
  className,
}: PlacesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instance = useMaplibre(containerRef);
  const markers = useRef(new Map<string, { marker: Marker; root: Root }>());
  const callbacks = useRef({ onSelect, onHover });
  callbacks.current = { onSelect, onHover };

  // Synchronise les marqueurs avec la liste (filtrée) de lieux.
  useEffect(() => {
    if (!instance) return;
    const { map, lib } = instance;
    const current = markers.current;
    const nextIds = new Set(places.map((p) => p.id));

    for (const [id, { marker, root }] of current) {
      if (nextIds.has(id)) continue;
      marker.remove();
      queueMicrotask(() => root.unmount());
      current.delete(id);
    }

    places.forEach((place, index) => {
      let entry = current.get(place.id);
      if (!entry) {
        const el = document.createElement("div");
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          callbacks.current.onSelect?.(place.id);
        });
        el.addEventListener("mouseenter", () => callbacks.current.onHover?.(place.id));
        el.addEventListener("mouseleave", () => callbacks.current.onHover?.(null));
        const marker = new lib.Marker({ element: el, anchor: "center" }).setLngLat([place.lng, place.lat]).addTo(map);
        entry = { marker, root: createRoot(el) };
        current.set(place.id, entry);
      }
      const isSelected = place.id === selectedId;
      const isHovered = place.id === hoveredId;
      entry.marker.setLngLat([place.lng, place.lat]);
      entry.marker.getElement().style.zIndex = isSelected ? "20" : isHovered ? "10" : "1";
      entry.root.render(
        <MarkerPin
          color={CATEGORY_COLORS[place.category?.slug ?? ""] ?? DEFAULT_CATEGORY_COLOR}
          icon={place.category?.icon}
          label={place.title}
          index={route ? index : undefined}
          selected={isSelected}
          highlighted={isHovered}
        />,
      );
    });
  }, [instance, places, selectedId, hoveredId, route]);

  // Clic sur le fond de carte : désélection.
  useEffect(() => {
    if (!instance) return;
    const onClick = () => callbacks.current.onSelect?.(null);
    instance.map.on("click", onClick);
    return () => {
      instance.map.off("click", onClick);
    };
  }, [instance]);

  // Cadre la carte sur l'ensemble des résultats.
  const paddingKey = JSON.stringify(padding ?? {});
  useEffect(() => {
    if (!instance || places.length === 0) return;
    const { map, lib } = instance;
    const pad = { top: 64, bottom: 64, left: 64, right: 64, ...(JSON.parse(paddingKey) as PlacesMapProps["padding"]) };
    if (places.length === 1) {
      map.jumpTo({ center: [places[0].lng, places[0].lat], zoom: 14 });
      return;
    }
    const bounds = new lib.LngLatBounds();
    places.forEach((p) => bounds.extend([p.lng, p.lat]));
    map.fitBounds(bounds, { padding: pad, maxZoom: 14, duration: 500 });
  }, [instance, places, paddingKey]);

  // Vole vers le lieu sélectionné (uniquement au changement de sélection).
  const placesRef = useRef(places);
  placesRef.current = places;
  useEffect(() => {
    if (!instance || !selectedId) return;
    const place = placesRef.current.find((p) => p.id === selectedId);
    if (!place) return;
    instance.map.flyTo({
      center: [place.lng, place.lat],
      zoom: Math.max(instance.map.getZoom(), 13.5),
      offset: [0, -focusOffsetY],
      speed: 1.6,
    });
  }, [instance, selectedId, focusOffsetY]);

  // Tracé d'itinéraire, réappliqué après chaque changement de style (thème).
  useEffect(() => {
    if (!instance || !route) return;
    const { map } = instance;
    const data: GeoJSON.Feature = {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: places.map((p) => [p.lng, p.lat]) },
    };
    const draw = () => {
      if (!map.isStyleLoaded()) return;
      const source = map.getSource<GeoJSONSource>(ROUTE_ID);
      if (source) {
        source.setData(data);
        return;
      }
      map.addSource(ROUTE_ID, { type: "geojson", data });
      map.addLayer({
        id: ROUTE_ID,
        type: "line",
        source: ROUTE_ID,
        layout: { "line-cap": "round" },
        paint: { "line-color": "#e3a13b", "line-width": 2.5, "line-dasharray": [2, 2] },
      });
    };
    draw();
    map.on("styledata", draw);
    return () => {
      map.off("styledata", draw);
    };
  }, [instance, places, route]);

  useEffect(() => {
    const current = markers.current;
    return () => {
      for (const { root } of current.values()) queueMicrotask(() => root.unmount());
      current.clear();
    };
  }, []);

  return <div ref={containerRef} className={cn("h-full w-full bg-muted", className)} />;
}
