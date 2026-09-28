"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const FAVORITES_TITLE = "Mon carnet de favoris";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createItinerary(input: { title: string; placeIds: string[]; isPublic: boolean }) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "AUTH_REQUIRED" as const };

  const title = input.title.trim().slice(0, 120) || "Mon itinéraire";
  const { data, error } = await supabase
    .from("custom_itineraries")
    .insert({ user_id: user.id, title, place_ids: input.placeIds, is_public: input.isPublic })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/compte");
  return { id: data.id as string };
}

/** Publie (ou met à jour) le carnet de favoris sous forme d'itinéraire public partageable. */
export async function shareFavorites() {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "AUTH_REQUIRED" as const };

  const { data: favorites } = await supabase
    .from("favorites")
    .select("place_id")
    .eq("user_id", user.id)
    .order("created_at");
  const placeIds = (favorites ?? []).map((f: { place_id: string }) => f.place_id);

  const { data: existing } = await supabase
    .from("custom_itineraries")
    .select("id")
    .eq("user_id", user.id)
    .eq("title", FAVORITES_TITLE)
    .maybeSingle();

  const { data, error } = existing
    ? await supabase
        .from("custom_itineraries")
        .update({ place_ids: placeIds, is_public: true })
        .eq("id", existing.id)
        .select("id")
        .single()
    : await supabase
        .from("custom_itineraries")
        .insert({ user_id: user.id, title: FAVORITES_TITLE, place_ids: placeIds, is_public: true })
        .select("id")
        .single();

  if (error) return { error: error.message };
  revalidatePath("/compte");
  return { id: data.id as string };
}

export async function setItineraryVisibility(id: string, isPublic: boolean) {
  const { supabase, user } = await requireUser();
  if (!user) return;
  await supabase.from("custom_itineraries").update({ is_public: isPublic }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/compte");
  revalidatePath(`/carnet/${id}`);
}

export async function deleteItinerary(id: string) {
  const { supabase, user } = await requireUser();
  if (!user) return;
  await supabase.from("custom_itineraries").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/compte");
}
