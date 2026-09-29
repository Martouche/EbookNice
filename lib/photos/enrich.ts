// Recherche + association automatique de photos HD à un spot.
// Partagé par scripts/enrich-photos.ts (clé service) et les Server Actions admin (session admin + RLS).

import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ImageCredit } from "../types";
import {
  searchPexels,
  searchUnsplash,
  searchWikimedia,
  trackUnsplashDownload,
  type PhotoCandidate,
} from "./providers";

export interface EnrichablePlace {
  id: string;
  slug: string;
  title: string;
  city: string;
  images: string[];
  image_credits: ImageCredit[] | null;
  category: { slug: string; name: string } | null;
}

export interface EnrichResult {
  added: number;
  images: string[];
  credits: ImageCredit[];
  /** Au moins une photo provient du fallback générique de la catégorie. */
  usedFallback: boolean;
  /** Simulation : photos qui seraient ajoutées (fichier / auteur). */
  preview?: string[];
  error?: string;
}

export const MIN_PHOTOS = 3;
export const MAX_PHOTOS = 5;

/** Requêtes de secours par catégorie : belles photos génériques de la Côte d'Azur. */
const CATEGORY_FALLBACKS: Record<string, string[]> = {
  plage: ["Baie des Anges plage galets Nice", "Promenade des Anglais plage", "Nice beach"],
  "point-de-vue": ["Baie des Anges panorama Nice", "Nice panorama Colline du Château", "Villefranche-sur-Mer rade"],
  restaurant: ["Socca Nice", "Vieux Nice terrasse", "Cours Saleya restaurants"],
  activite: ["Vieux Nice ruelle", "Cours Saleya marché", "Nice old town"],
  randonnee: ["Sentier du littoral Cap Ferrat", "Mont Boron Nice", "French Riviera coastal path"],
};
const DEFAULT_FALLBACKS = ["Nice Côte d'Azur", "Baie des Anges"];

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const STOPWORDS = new Set(["le", "la", "les", "du", "de", "des", "et", "chez", "sur", "aux", "au", "en", "the", "of", "and"]);
/** Mots trop génériques pour prouver à eux seuls qu'une photo montre CE lieu. */
const GENERIC = new Set([
  "plage", "sentier", "chemin", "musee", "restaurant", "marche", "rade", "fort", "promenade", "colline",
  "cascade", "point", "vue", "port", "parc", "jardin", "place", "rue", "cours", "littoral", "mont", "cap", "beach",
]);

function tokens(s: string) {
  return normalize(s)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

/** La photo parle-t-elle bien de ce lieu ? Au moins un mot distinctif du titre, sinon tous les mots génériques. */
function isRelevant(candidate: PhotoCandidate, place: EnrichablePlace) {
  const cityTokens = new Set(tokens(place.city));
  const titleTokens = tokens(place.title).filter((t) => !cityTokens.has(t));
  if (titleTokens.length === 0) return true;
  const text = normalize(candidate.text);
  const distinctive = titleTokens.filter((t) => !GENERIC.has(t));
  return distinctive.length > 0 ? distinctive.some((t) => text.includes(t)) : titleTokens.every((t) => text.includes(t));
}

const landscapeFirst = (list: PhotoCandidate[]) =>
  [...list].sort((a, b) => Number(b.width >= b.height) - Number(a.width >= a.height));

async function findPhotos(place: EnrichablePlace, count: number, exclude: Set<string>) {
  const picked: PhotoCandidate[] = [];
  const seen = new Set(exclude);
  let usedFallback = false;

  const take = (list: PhotoCandidate[], filter?: (c: PhotoCandidate) => boolean, max = count) => {
    for (const c of landscapeFirst(list)) {
      if (picked.length >= max) return;
      const key = `${c.provider}:${c.sourceId}`;
      if (seen.has(key) || (filter && !filter(c))) continue;
      seen.add(key);
      picked.push(c);
    }
  };

  const specific = (c: PhotoCandidate) => isRelevant(c, place);
  const searches: (() => Promise<PhotoCandidate[]>)[] = [
    () => searchWikimedia(`"${place.title}" ${place.city}`),
    () => searchWikimedia(`${place.title} ${place.city}`),
    () => searchUnsplash(`${place.title} ${place.city}`),
    () => searchPexels(`${place.title} ${place.city}`),
  ];
  for (const search of searches) {
    if (picked.length >= count) break;
    take(await search(), specific);
  }

  // Fallback : photos génériques choisies par catégorie, plafonnées à MIN_PHOTOS au total.
  const fallbackMax = Math.min(count, MIN_PHOTOS);
  if (picked.length < fallbackMax) {
    const before = picked.length;
    const queries = [
      ...(CATEGORY_FALLBACKS[place.category?.slug ?? ""] ?? DEFAULT_FALLBACKS),
      ...(place.category ? [`${place.category.name} ${place.city}`] : []),
    ];
    for (const q of queries) {
      if (picked.length >= fallbackMax) break;
      take(await searchWikimedia(q, 10), undefined, fallbackMax);
      if (picked.length < fallbackMax) take(await searchUnsplash(q, 5), undefined, fallbackMax);
    }
    usedFallback = picked.length > before;
  }

  return { picked, usedFallback };
}

/** Copie une photo Commons dans le bucket `places-images` (URLs stables, servies via next/image). */
async function uploadToStorage(supabase: SupabaseClient, place: EnrichablePlace, c: PhotoCandidate) {
  const res = await fetch(c.url, { headers: { "User-Agent": "NiceGuideDesLocaux/1.0" } });
  if (!res.ok) throw new Error(`Téléchargement impossible (${res.status})`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.byteLength > 10 * 1024 * 1024) throw new Error("Image trop lourde");

  const hash = createHash("sha1").update(`${c.provider}:${c.sourceId}`).digest("hex").slice(0, 12);
  const path = `${place.slug}/auto-${c.provider}-${hash}.jpg`;
  const { error } = await supabase.storage
    .from("places-images")
    .upload(path, bytes, { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return supabase.storage.from("places-images").getPublicUrl(path).data.publicUrl;
}

/**
 * Complète les photos d'un spot jusqu'à `target` (3 à 5), met à jour `images` + `image_credits`.
 * Ne remplace jamais les photos existantes.
 */
export async function enrichPlace(
  supabase: SupabaseClient,
  place: EnrichablePlace,
  { target = MAX_PHOTOS, dryRun = false }: { target?: number; dryRun?: boolean } = {},
): Promise<EnrichResult> {
  const credits = place.image_credits ?? [];
  const missing = Math.max(0, Math.min(MAX_PHOTOS, target) - place.images.length);
  const base = { added: 0, images: place.images, credits, usedFallback: false };
  if (missing === 0) return base;

  const exclude = new Set(credits.map((c) => `${c.provider}:${c.source_id}`));
  const { picked, usedFallback } = await findPhotos(place, missing, exclude);
  if (dryRun) return { ...base, added: picked.length, usedFallback, preview: picked.map((c) => `${c.sourceId} — ${c.author}`) };

  const newImages: string[] = [];
  const newCredits: ImageCredit[] = [];
  for (const c of picked) {
    try {
      const url = c.hotlink ? c.url : await uploadToStorage(supabase, place, c);
      if (c.trackUrl) await trackUnsplashDownload(c.trackUrl);
      newImages.push(url);
      newCredits.push({
        url,
        author: c.author,
        license: c.license,
        license_url: c.licenseUrl ?? null,
        source_url: c.sourceUrl,
        provider: c.provider,
        source_id: c.sourceId,
      });
    } catch {
      // Photo ignorée : on passe à la suivante.
    }
  }
  if (newImages.length === 0) return { ...base, usedFallback, error: "Aucune photo exploitable trouvée." };

  const images = [...place.images, ...newImages];
  const allCredits = [...credits, ...newCredits];
  const { error } = await supabase.from("places").update({ images, image_credits: allCredits }).eq("id", place.id);
  if (error) {
    return { ...base, usedFallback, error: isMissingColumn(error) ? MIGRATION_HINT : error.message };
  }
  return { added: newImages.length, images, credits: allCredits, usedFallback };
}

export const MIGRATION_HINT = "Colonne image_credits absente : exécutez supabase/migrations/002_image_credits.sql.";
export const isMissingColumn = (error: { code?: string } | null) => error?.code === "42703" || error?.code === "PGRST204";

export const ENRICH_SELECT = "id, slug, title, city, images, image_credits, category:categories(slug, name)";
