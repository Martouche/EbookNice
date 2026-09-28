"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookmarkPlus, Dices, Footprints, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createItinerary } from "@/app/actions/itineraries";
import { CategoryIcon } from "@/components/category-icon";
import { useFavorites } from "@/components/favorites-provider";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Segmented } from "@/components/ui/segmented";
import { DURATIONS, VIBES, buildItinerary, type DurationId, type ItineraryStop, type VibeId } from "@/lib/itinerary";
import type { PlaceWithRelations } from "@/lib/types";

const PlacesMap = dynamic(() => import("@/components/map/places-map").then((m) => m.PlacesMap), { ssr: false });

const spring = { type: "spring", stiffness: 400, damping: 30 } as const;

export function ItineraryGenerator({ places }: { places: PlaceWithRelations[] }) {
  const router = useRouter();
  const { isAuthed } = useFavorites();
  const [duration, setDuration] = useState<DurationId>("half");
  const [vibe, setVibe] = useState<VibeId>("all");
  const [stops, setStops] = useState<ItineraryStop[] | null>(null);
  const [generation, setGeneration] = useState(0);
  const [saving, startSaving] = useTransition();

  const generate = (d = duration, v = vibe) => {
    setStops(buildItinerary(places, d, v));
    setGeneration((g) => g + 1);
  };

  const save = () => {
    if (!stops) return;
    if (!isAuthed) {
      router.push("/connexion?next=/");
      return;
    }
    const label = DURATIONS.find((d) => d.id === duration)?.label ?? "";
    startSaving(async () => {
      const result = await createItinerary({
        title: `${label} · ${VIBES.find((v) => v.id === vibe)?.label}`,
        placeIds: stops.map((s) => s.place.id),
        isPublic: true,
      });
      if ("id" in result && result.id) router.push(`/carnet/${result.id}`);
    });
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-line bg-card">
      <div className="grid gap-8 p-5 md:grid-cols-[1fr_1.1fr] md:p-10">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">Itinéraire express</p>
          <h2 className="mt-3 font-display text-5xl leading-[0.95] md:text-6xl">
            Combien de temps <span className="italic text-muted-foreground">as-tu ?</span>
          </h2>

          <div className="mt-8 space-y-6">
            <div className="no-scrollbar -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
              <Segmented
                id="duration"
                value={duration}
                onChange={(d) => {
                  setDuration(d);
                  if (stops) generate(d, vibe);
                }}
                options={DURATIONS.map((d) => ({ value: d.id, label: d.label }))}
              />
            </div>

            <div>
              <p className="mb-3 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Envie du moment</p>
              <div className="flex flex-wrap gap-2">
                {VIBES.map((v) => (
                  <Chip
                    key={v.id}
                    active={vibe === v.id}
                    onClick={() => {
                      setVibe(v.id);
                      if (stops) generate(duration, v.id);
                    }}
                  >
                    {v.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="accent" onClick={() => generate()} disabled={places.length === 0}>
                {stops ? <Dices /> : <Footprints />}
                {stops ? "Une autre idée" : "Composer ma balade"}
              </Button>
              {stops && stops.length > 0 && (
                <Button size="lg" variant="outline" onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" /> : <BookmarkPlus />}
                  Garder dans mon carnet
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="min-h-64">
          <AnimatePresence mode="popLayout" initial={false}>
            {!stops ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={spring}
                className="grid h-full min-h-64 place-items-center rounded-3xl border border-dashed border-line-strong p-8 text-center text-sm text-muted-foreground"
              >
                Choisis ta durée et ton humeur : on s&apos;occupe du reste, en regroupant les étapes proches.
              </motion.div>
            ) : stops.length === 0 ? (
              <motion.div
                key="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid h-full min-h-64 place-items-center rounded-3xl border border-dashed border-line-strong p-8 text-center text-sm text-muted-foreground"
              >
                Aucune adresse ne correspond encore à cette envie.
              </motion.div>
            ) : (
              <motion.div
                key={generation}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={spring}
                className="space-y-4"
              >
                <div className="h-56 overflow-hidden rounded-3xl border border-line">
                  <PlacesMap places={stops.map((s) => s.place)} route />
                </div>
                <ol className="divide-y divide-line">
                  {stops.map((stop, i) => (
                    <li key={stop.place.id}>
                      {(i === 0 || stops[i - 1].day !== stop.day) && duration === "weekend" && (
                        <p className="pt-3 pb-1 font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">Jour {stop.day}</p>
                      )}
                      <Link href={`/lieux/${stop.place.slug}`} className="group flex items-center gap-4 py-3">
                        <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{stop.start}</span>
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted">
                          <CategoryIcon icon={stop.place.category?.icon} className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium group-hover:underline">{stop.place.title}</span>
                          <span className="block text-xs text-muted-foreground">
                            {stop.place.city} · ~{stop.stayMinutes} min
                            {stop.kmFromPrevious !== null && ` · ${stop.kmFromPrevious.toFixed(1)} km`}
                          </span>
                        </span>
                        {stop.place.is_free && (
                          <span className="font-mono text-[10px] tracking-wider text-emerald-500 uppercase">Free</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
