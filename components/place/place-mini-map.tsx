"use client";

import dynamic from "next/dynamic";
import type { MapPlace } from "@/components/map/places-map";

const PlacesMap = dynamic(() => import("@/components/map/places-map").then((m) => m.PlacesMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

/** Wrapper client : `next/dynamic` avec `ssr: false` est interdit dans un Server Component. */
export function PlaceMiniMap({ places, route }: { places: MapPlace[]; route?: boolean }) {
  return <PlacesMap places={places} selectedId={places.length === 1 ? places[0].id : null} route={route} />;
}
