"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoJSONSource, Marker } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import Supercluster from "supercluster";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/client";
import type { PlaceWithRelations } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MarkerPin } from "./marker-pin";
import { useMaplibre, type MaplibreOptions } from "./use-maplibre";

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
  /** Regroupe les marqueurs proches en bulles chiffrées quand on dézoome (carte de l'explorer). */
  cluster?: boolean;
  /** Bouton « Me localiser » + point bleu. */
  geolocate?: boolean;
  controls?: MaplibreOptions["controls"];
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
  geolocate,
  cluster,
  controls,
  className,
}: PlacesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instance = useMaplibre(containerRef, { geolocate, controls });
  const markers = useRef(new Map<string, { marker: Marker; root: Root }>());
  const { t } = useI18n();
  const label = useRef(t.common.places);
  const callbacks = useRef({ onSelect, onHover });
  callbacks.current = { onSelect, onHover };

  // Regroupement : index spatial des lieux, recalculé à chaque fin de zoom. Les lieux regroupés sont masqués
  // (sauf le lieu sélectionné ou survolé) et remplacés par une bulle « N » qui zoome sur son groupe au clic.
  const index = useMemo(() => {
    if (!cluster || route) return null;
    const sc = new Supercluster<{ id: string }>({ radius: 48, maxZoom: 15 });
    sc.load(places.map((p) => ({ type: "Feature", properties: { id: p.id }, geometry: { type: "Point", coordinates: [p.lng, p.lat] } })));
    return sc;
  }, [places, cluster, route]);
  const [clustered, setClustered] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    if (!instance || !index) {
      setClustered(new Set());
      return;
    }
    const { map, lib } = instance;
    let bubbles: Marker[] = [];
    const update = () => {
      bubbles.forEach((m) => m.remove());
      bubbles = [];
      const hidden = new Set<string>();
      for (const item of index.getClusters([-180, -85, 180, 85], Math.round(map.getZoom()))) {
        if (!("cluster" in item.properties)) continue;
        const { cluster_id: id, point_count: count } = item.properties;
        index.getLeaves(id, Infinity).forEach((leaf) => hidden.add(leaf.properties.id));
        const el = document.createElement("button");
        el.type = "button";
        el.className = "map-cluster";
        el.textContent = String(count);
        el.setAttribute("aria-label", label.current(count));
        const size = Math.min(56, 34 + Math.log2(count) * 5);
        el.style.width = el.style.height = `${size}px`;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          map.easeTo({ center: item.geometry.coordinates as [number, number], zoom: index.getClusterExpansionZoom(id) + 0.5 });
        });
        bubbles.push(new lib.Marker({ element: el, anchor: "center" }).setLngLat(item.geometry.coordinates as [number, number]).addTo(map));
      }
      setClustered(hidden);
    };
    update();
    map.on("zoomend", update);
    return () => {
      map.off("zoomend", update);
      bubbles.forEach((m) => m.remove());
    };
  }, [instance, index]);

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
      entry.marker.getElement().style.display = clustered.has(place.id) && !isSelected && !isHovered ? "none" : "";
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
  }, [instance, places, selectedId, hoveredId, route, clustered]);

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
