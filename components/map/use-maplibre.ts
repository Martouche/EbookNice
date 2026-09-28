"use client";

import type { Map as MapLibreMap } from "maplibre-gl";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, type RefObject } from "react";
import { NICE_CENTER } from "@/lib/constants";
import { MAP_STYLES } from "./map-styles";

type MapLibreModule = typeof import("maplibre-gl");

/** Instancie une carte MapLibre côté client et suit le thème clair/sombre. */
export function useMaplibre(
  containerRef: RefObject<HTMLDivElement | null>,
  options: { center?: { lat: number; lng: number }; zoom?: number } = {},
) {
  const { resolvedTheme } = useTheme();
  const [state, setState] = useState<{ map: MapLibreMap; lib: MapLibreModule } | null>(null);
  const initialOptions = useRef(options);
  const themeRef = useRef(resolvedTheme);
  const appliedTheme = useRef(resolvedTheme);
  themeRef.current = resolvedTheme;

  useEffect(() => {
    let map: MapLibreMap | undefined;
    let cancelled = false;

    (async () => {
      const lib = await import("maplibre-gl");
      if (cancelled || !containerRef.current) return;
      lib.setWorkerUrl(`${window.location.origin}/maplibre/maplibre-gl-worker.mjs`);
      const { center = NICE_CENTER, zoom = 12 } = initialOptions.current;
      appliedTheme.current = themeRef.current;
      const instance = new lib.Map({
        container: containerRef.current,
        style: themeRef.current === "light" ? MAP_STYLES.light : MAP_STYLES.dark,
        center: [center.lng, center.lat],
        zoom,
        attributionControl: { compact: true },
      });
      map = instance;
      instance.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");
      instance.once("load", () => !cancelled && setState({ map: instance, lib }));
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [containerRef]);

  useEffect(() => {
    if (!state || !resolvedTheme || appliedTheme.current === resolvedTheme) return;
    appliedTheme.current = resolvedTheme;
    state.map.setStyle(resolvedTheme === "light" ? MAP_STYLES.light : MAP_STYLES.dark);
  }, [state, resolvedTheme]);

  return state;
}
