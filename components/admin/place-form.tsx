"use client";

import { AnimatePresence, motion, Reorder } from "framer-motion";
import { FileAudio, ImagePlus, Loader2, MapPin, Route, Save, X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useActionState, useState, type ChangeEvent, type ReactNode } from "react";
import { savePlace, type FormState } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { BEST_TIME_LABELS, NICE_CENTER, PRICE_LABELS, SUGGESTED_TAGS } from "@/lib/constants";
import { uploadToStorage, type Bucket } from "@/lib/storage";
import type { BestTime, Category, Chapter, Place } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";

const LocationPicker = dynamic(() => import("@/components/map/location-picker").then((m) => m.LocationPicker), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse rounded-2xl bg-muted md:h-96" />,
});

function Field({ label, htmlFor, children, className }: { label: string; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-5 rounded-3xl border border-line bg-card p-5 md:p-6">
      <h2 className="font-display text-2xl">{title}</h2>
      {children}
    </section>
  );
}

export function PlaceForm({
  place,
  chapters,
  categories,
}: {
  place?: Place;
  chapters: Chapter[];
  categories: Category[];
}) {
  const [state, action, saving] = useActionState<FormState, FormData>(savePlace, {});
  const [title, setTitle] = useState(place?.title ?? "");
  const [slug, setSlug] = useState(place?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!place);
  const [coords, setCoords] = useState({ lat: place?.lat ?? NICE_CENTER.lat, lng: place?.lng ?? NICE_CENTER.lng });
  const [priceLevel, setPriceLevel] = useState(place?.price_level ?? 0);
  const [images, setImages] = useState<string[]>(place?.images ?? []);
  const [gpxUrl, setGpxUrl] = useState(place?.gpx_url ?? "");
  const [audioUrl, setAudioUrl] = useState(place?.audio_tip_url ?? "");
  const [tags, setTags] = useState<string[]>(place?.tags ?? []);
  const [customTag, setCustomTag] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const folder = slugify(slug || title) || "sans-titre";

  const upload = async (bucket: Bucket, files: FileList | null, key: string, onDone: (urls: string[]) => void) => {
    if (!files?.length) return;
    setUploading(key);
    setUploadError(null);
    try {
      onDone(await Promise.all([...files].map((file) => uploadToStorage(bucket, file, folder))));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Échec de l'upload");
    } finally {
      setUploading(null);
    }
  };

  const onImages = (e: ChangeEvent<HTMLInputElement>) =>
    upload("places-images", e.target.files, "images", (urls) => setImages((prev) => [...prev, ...urls]));

  const allTags = [...new Set([...SUGGESTED_TAGS, ...tags])];

  return (
    <form action={action} className="space-y-6 pb-24">
      {place && <input type="hidden" name="id" value={place.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="tags" value={JSON.stringify(tags)} />
      <input type="hidden" name="gpx_url" value={gpxUrl} />
      <input type="hidden" name="audio_tip_url" value={audioUrl} />
      <input type="hidden" name="price_level" value={priceLevel} />
      <input type="hidden" name="lat" value={coords.lat} />
      <input type="hidden" name="lng" value={coords.lng} />

      <Panel title="L'essentiel">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Titre" htmlFor="title">
            <Input
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Slug (URL)" htmlFor="slug">
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="font-mono"
            />
          </Field>
          <Field label="Catégorie" htmlFor="category_id">
            <Select id="category_id" name="category_id" defaultValue={place?.category_id ?? ""}>
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Chapitre" htmlFor="chapter_id">
            <Select id="chapter_id" name="chapter_id" defaultValue={place?.chapter_id ?? ""}>
              <option value="">—</option>
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Description" htmlFor="description">
          <Textarea id="description" name="description" defaultValue={place?.description ?? ""} rows={4} />
        </Field>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="is_featured" defaultChecked={place?.is_featured} className="size-4 accent-ocre" />
          Mettre en avant (coups de cœur de l&apos;accueil)
        </label>
      </Panel>

      <Panel title="Conseil du Local">
        <Field label="Le tip qui fait la différence" htmlFor="local_tip">
          <Textarea id="local_tip" name="local_tip" defaultValue={place?.local_tip ?? ""} rows={3} className="font-display text-lg italic" />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="audio/*"
              className="sr-only"
              onChange={(e) => upload("places-images", e.target.files, "audio", ([url]) => setAudioUrl(url))}
            />
            <span className="inline-flex h-9 items-center gap-2 rounded-full border border-line-strong px-4 text-sm transition-colors duration-100 hover:bg-muted">
              {uploading === "audio" ? <Loader2 className="size-4 animate-spin" /> : <FileAudio className="size-4" />}
              {audioUrl ? "Remplacer l'audio" : "Ajouter un conseil audio"}
            </span>
          </label>
          {audioUrl && (
            <>
              <audio controls src={audioUrl} className="h-9" />
              <Button type="button" size="sm" variant="ghost" onClick={() => setAudioUrl("")}>
                <X />
                Retirer
              </Button>
            </>
          )}
        </div>
      </Panel>

      <Panel title="Localisation">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 text-ocre" />
          Cliquez sur la carte ou déplacez le repère pour fixer la position exacte.
        </p>
        <LocationPicker value={coords} onChange={setCoords} />
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Latitude" htmlFor="lat-input">
            <Input
              id="lat-input"
              type="number"
              step="any"
              value={coords.lat}
              onChange={(e) => setCoords((c) => ({ ...c, lat: Number(e.target.value) }))}
              className="font-mono"
            />
          </Field>
          <Field label="Longitude" htmlFor="lng-input">
            <Input
              id="lng-input"
              type="number"
              step="any"
              value={coords.lng}
              onChange={(e) => setCoords((c) => ({ ...c, lng: Number(e.target.value) }))}
              className="font-mono"
            />
          </Field>
          <Field label="Adresse" htmlFor="address">
            <Input id="address" name="address" defaultValue={place?.address ?? ""} />
          </Field>
          <Field label="Ville" htmlFor="city">
            <Input id="city" name="city" defaultValue={place?.city ?? "Nice"} />
          </Field>
        </div>
      </Panel>

      <Panel title="Prix, moment & tags">
        <Field label="Niveau de prix">
          <div className="flex flex-wrap gap-2">
            {PRICE_LABELS.map((label, level) => (
              <Chip
                key={label}
                active={priceLevel === level}
                onClick={() => setPriceLevel(level)}
                className={cn(level === 0 && priceLevel === 0 && "border-emerald-500 bg-emerald-500 text-white")}
              >
                {level === 0 ? "0 € · Gratuit" : label}
              </Chip>
            ))}
          </div>
        </Field>
        <Field label="Meilleur moment" htmlFor="best_time_to_visit">
          <Select id="best_time_to_visit" name="best_time_to_visit" defaultValue={place?.best_time_to_visit ?? "ANYTIME"}>
            {(Object.keys(BEST_TIME_LABELS) as BestTime[]).map((key) => (
              <option key={key} value={key}>
                {BEST_TIME_LABELS[key]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tags">
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Chip
                key={tag}
                active={tags.includes(tag)}
                onClick={() => setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]))}
              >
                {tag}
              </Chip>
            ))}
          </div>
          <div className="flex max-w-sm gap-2 pt-1">
            <Input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Nouveau tag…"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const tag = customTag.trim();
                if (tag && !tags.includes(tag)) setTags((t) => [...t, tag]);
                setCustomTag("");
              }}
            />
          </div>
        </Field>
      </Panel>

      <Panel title="Médias">
        <Field label="Photos (glisser pour réordonner — la première sert de couverture)">
          <Reorder.Group axis="x" values={images} onReorder={setImages} className="flex flex-wrap gap-3">
            <AnimatePresence initial={false}>
              {images.map((src) => (
                <Reorder.Item
                  key={src}
                  value={src}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="relative size-28 cursor-grab overflow-hidden rounded-2xl border border-line active:cursor-grabbing"
                >
                  <Image src={src} alt="" fill sizes="112px" className="pointer-events-none object-cover" />
                  <button
                    type="button"
                    aria-label="Retirer la photo"
                    onClick={() => setImages((prev) => prev.filter((i) => i !== src))}
                    className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white"
                  >
                    <X className="size-3.5" />
                  </button>
                </Reorder.Item>
              ))}
            </AnimatePresence>
            <label className="grid size-28 cursor-pointer place-items-center rounded-2xl border border-dashed border-line-strong text-muted-foreground transition-colors duration-100 hover:bg-muted">
              <input type="file" accept="image/*" multiple className="sr-only" onChange={onImages} />
              {uploading === "images" ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            </label>
          </Reorder.Group>
        </Field>

        <Field label="Tracé GPX (randonnées)">
          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".gpx,application/gpx+xml"
                className="sr-only"
                onChange={(e) => upload("gpx-tracks", e.target.files, "gpx", ([url]) => setGpxUrl(url))}
              />
              <span className="inline-flex h-9 items-center gap-2 rounded-full border border-line-strong px-4 text-sm transition-colors duration-100 hover:bg-muted">
                {uploading === "gpx" ? <Loader2 className="size-4 animate-spin" /> : <Route className="size-4" />}
                {gpxUrl ? "Remplacer le GPX" : "Téléverser un GPX"}
              </span>
            </label>
            {gpxUrl && (
              <>
                <a href={gpxUrl} className="max-w-xs truncate font-mono text-xs text-muted-foreground underline">
                  {gpxUrl.split("/").pop()}
                </a>
                <Button type="button" size="sm" variant="ghost" onClick={() => setGpxUrl("")}>
                  <X />
                  Retirer
                </Button>
              </>
            )}
          </div>
        </Field>
        {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
      </Panel>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-glass pb-safe backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-4 py-3 md:px-8">
          <AnimatePresence>
            {state.error && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="text-sm text-red-500"
                role="alert"
              >
                {state.error}
              </motion.p>
            )}
          </AnimatePresence>
          <Button type="submit" variant="accent" disabled={saving || uploading !== null}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            {place ? "Enregistrer" : "Publier le spot"}
          </Button>
        </div>
      </div>
    </form>
  );
}
