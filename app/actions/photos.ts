"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { ENRICH_SELECT, MAX_PHOTOS, MIGRATION_HINT, enrichPlace, isMissingColumn, type EnrichablePlace } from "@/lib/photos/enrich";

export interface PhotoEnrichState {
  added: number;
  images: string[];
  usedFallback: boolean;
  error?: string;
}

/** Trouve et ajoute des photos HD à un spot (jusqu'à 5). Un appel = un spot : compatible timeouts Vercel. */
export async function enrichPlacePhotos(placeId: string): Promise<PhotoEnrichState> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("places").select(ENRICH_SELECT).eq("id", placeId).single();
  if (error || !data) {
    return { added: 0, images: [], usedFallback: false, error: isMissingColumn(error) ? MIGRATION_HINT : "Spot introuvable." };
  }

  const place = data as unknown as EnrichablePlace;
  const result = await enrichPlace(supabase, place, { target: MAX_PHOTOS });
  if (result.added > 0) revalidatePath("/", "layout");
  return { added: result.added, images: result.images, usedFallback: result.usedFallback, error: result.error };
}
