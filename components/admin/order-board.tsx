"use client";

import { AnimatePresence, motion, Reorder, useDragControls } from "framer-motion";
import { ArrowDown, ArrowUp, Check, GripVertical, Loader2, Save, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { reorderPlaces, setPlaceFeatured } from "@/app/actions/admin";
import { CategoryIcon } from "@/components/category-icon";
import { PlaceCover } from "@/components/place-cover";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { priceLabel } from "@/lib/constants";
import type { PlaceWithRelations } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface OrderGroup {
  slug: string;
  title: string;
  icon: string;
  places: PlaceWithRelations[];
}

const spring = { type: "spring", stiffness: 400, damping: 30 } as const;

function OrderRow({
  place,
  rank,
  total,
  onMove,
  featured,
  onToggleFeatured,
}: {
  place: PlaceWithRelations;
  rank: number;
  total: number;
  onMove: (dir: -1 | 1) => void;
  featured: boolean;
  onToggleFeatured: () => void;
}) {
  // Glisser uniquement depuis la poignée : le reste de la ligne laisse défiler la page sur mobile.
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={place}
      dragListener={false}
      dragControls={controls}
      transition={spring}
      whileDrag={{ scale: 1.02, boxShadow: "0 12px 32px rgb(0 0 0 / 0.25)" }}
      className="flex items-center gap-3 rounded-2xl border border-line bg-card p-2.5 pr-3"
    >
      <button
        type="button"
        aria-label={`Déplacer ${place.title}`}
        onPointerDown={(e) => controls.start(e)}
        className="grid h-12 w-8 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-muted-foreground hover:bg-muted active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="w-6 shrink-0 text-center font-mono text-xs text-muted-foreground">{rank}</span>
      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl">
        <PlaceCover src={place.images[0]} title={place.title} category={place.category} sizes="48px" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{place.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {place.city} · {priceLabel(place.price_level)}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggleFeatured}
        aria-pressed={featured}
        aria-label={featured ? "Retirer des coups de cœur" : "Mettre en coup de cœur"}
        title={featured ? "Coup de cœur (accueil)" : "Mettre en coup de cœur sur l'accueil"}
        className="grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-100 hover:bg-muted"
      >
        <Star className={cn("size-4", featured ? "fill-ocre text-ocre" : "text-muted-foreground")} />
      </button>
      <div className="flex shrink-0 flex-col">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={rank === 1}
          aria-label="Monter"
          className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
        >
          <ArrowUp className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={rank === total}
          aria-label="Descendre"
          className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
        >
          <ArrowDown className="size-3.5" />
        </button>
      </div>
    </Reorder.Item>
  );
}

export function OrderBoard({ groups }: { groups: OrderGroup[] }) {
  const router = useRouter();
  const [active, setActive] = useState(groups[0]?.slug ?? "");
  const [lists, setLists] = useState(() => Object.fromEntries(groups.map((g) => [g.slug, g.places])));
  const [featured, setFeatured] = useState(
    () => new Set(groups.flatMap((g) => g.places.filter((p) => p.is_featured).map((p) => p.id))),
  );
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [saving, startSaving] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const list = lists[active] ?? [];
  const group = groups.find((g) => g.slug === active);

  const update = (next: PlaceWithRelations[]) => {
    setLists((l) => ({ ...l, [active]: next }));
    setDirty((d) => new Set(d).add(active));
    setMessage(null);
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(index + dir, 0, item);
    update(next);
  };

  const toggleFeatured = (id: string) => {
    const on = !featured.has(id);
    setFeatured((f) => {
      const next = new Set(f);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
    void setPlaceFeatured(id, on).then((r) => r.error && setMessage({ ok: false, text: r.error }));
  };

  const save = () =>
    startSaving(async () => {
      const result = await reorderPlaces(list.map((p) => p.id));
      if (result.error) {
        setMessage({ ok: false, text: result.error });
        return;
      }
      setDirty((d) => {
        const next = new Set(d);
        next.delete(active);
        return next;
      });
      setMessage({ ok: true, text: "Ordre enregistré — visible sur le site." });
      router.refresh();
    });

  return (
    <div className="space-y-5 pb-24">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {groups.map((g) => (
          <Chip key={g.slug} active={g.slug === active} onClick={() => setActive(g.slug)}>
            <CategoryIcon icon={g.icon} />
            {g.title}
            <span className="font-mono text-[10px] opacity-60">{g.places.length}</span>
            {dirty.has(g.slug) && <span className="size-1.5 rounded-full bg-ocre" aria-label="modifié" />}
          </Chip>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Glissez avec la poignée <GripVertical className="inline size-3.5" /> (ou utilisez les flèches) : l&apos;ordre
        s&apos;applique à l&apos;explorer et aux suggestions. L&apos;étoile place le spot dans les « Coups de cœur » de l&apos;accueil.
      </p>

      {group && (
        <Reorder.Group axis="y" values={list} onReorder={update} className="space-y-2">
          {list.map((place, i) => (
            <OrderRow
              key={place.id}
              place={place}
              rank={i + 1}
              total={list.length}
              onMove={(dir) => move(i, dir)}
              featured={featured.has(place.id)}
              onToggleFeatured={() => toggleFeatured(place.id)}
            />
          ))}
        </Reorder.Group>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-glass pb-safe backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-4 py-3 md:px-8">
          <AnimatePresence>
            {message && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={spring}
                className={cn("flex items-center gap-1.5 text-sm", message.ok ? "text-emerald-500" : "text-red-500")}
                role="status"
              >
                {message.ok && <Check className="size-4" />}
                {message.text}
              </motion.p>
            )}
          </AnimatePresence>
          <Button variant="accent" onClick={save} disabled={!dirty.has(active) || saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            Enregistrer l&apos;ordre
          </Button>
        </div>
      </div>
    </div>
  );
}
