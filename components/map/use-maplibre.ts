"use client";

import type { Map as MapLibreMap } from "maplibre-gl";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, type RefObject } from "react";
import { NICE_CENTER } from "@/lib/constants";
import { MAP_STYLES } from "./map-styles";

type MapLibreModule = typeof import("maplibre-gl");

export interface MaplibreOptions {
  center?: { lat: number; lng: number };
  zoom?: number;
  /** Point bleu « vous êtes ici » (suivi en continu, comme Google Maps). */
  geolocate?: boolean;
  /** Coin des boutons : en bas à droite quand une barre recouvre le haut de la carte (mobile). */
  controls?: "top-right" | "bottom-right";
}

const LOCALE_FR = {
  "GeolocateControl.FindMyLocation": "Me localiser",
  "GeolocateControl.LocationNotAvailable": "Position indisponible",
  "NavigationControl.ZoomIn": "Zoomer",
  "NavigationControl.ZoomOut": "Dézoomer",
};

/** Instancie une carte MapLibre côté client et suit le thème clair/sombre. */
export function useMaplibre(
  containerRef: RefObject<HTMLDivElement | null>,
  options: MaplibreOptions = {},
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
      const { center = NICE_CENTER, zoom = 12, geolocate = false, controls = "top-right" } = initialOptions.current;
      appliedTheme.current = themeRef.current;
      const instance = new lib.Map({
        container: containerRef.current,
        style: themeRef.current === "light" ? MAP_STYLES.light : MAP_STYLES.dark,
        center: [center.lng, center.lat],
        zoom,
        attributionControl: { compact: true },
        locale: LOCALE_FR,
      });
      map = instance;
      instance.addControl(new lib.NavigationControl({ showCompass: false }), controls);
      // Position GPS : reste dans le navigateur (rien n'est envoyé au serveur). Requiert HTTPS.
      if (geolocate && "geolocation" in navigator) {
        instance.addControl(
          new lib.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showAccuracyCircle: true,
            fitBoundsOptions: { maxZoom: 15 },
          }),
          controls,
        );
      }
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
