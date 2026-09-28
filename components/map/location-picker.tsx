"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { MapMouseEvent, Marker } from "maplibre-gl";
import { useEffect, useRef } from "react";
import { useMaplibre } from "./use-maplibre";

interface Coords {
  lat: number;
  lng: number;
}

const round = (n: number) => Math.round(n * 1e6) / 1e6;

/** Carte cliquable pour définir précisément latitude / longitude (back-office). */
export function LocationPicker({ value, onChange }: { value: Coords; onChange: (c: Coords) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instance = useMaplibre(containerRef, { center: value, zoom: 13 });
  const markerRef = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initialValue = useRef(value);

  useEffect(() => {
    if (!instance) return;
    const { map, lib } = instance;

    const marker = new lib.Marker({ color: "#e3a13b", draggable: true })
      .setLngLat([initialValue.current.lng, initialValue.current.lat])
      .addTo(map);
    marker.on("dragend", () => {
      const { lat, lng } = marker.getLngLat();
      onChangeRef.current({ lat: round(lat), lng: round(lng) });
    });
    markerRef.current = marker;

    const handleClick = (e: MapMouseEvent) => {
      onChangeRef.current({ lat: round(e.lngLat.lat), lng: round(e.lngLat.lng) });
    };
    map.on("click", handleClick);
    map.getCanvas().style.cursor = "crosshair";

    return () => {
      map.off("click", handleClick);
      marker.remove();
      markerRef.current = null;
    };
  }, [instance]);

  useEffect(() => {
    markerRef.current?.setLngLat([value.lng, value.lat]);
  }, [value.lat, value.lng]);

  return (
    <div ref={containerRef} className="h-72 w-full overflow-hidden rounded-2xl border border-line bg-muted md:h-96" />
  );
}
