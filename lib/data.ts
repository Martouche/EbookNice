import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Category, Chapter, CustomItinerary, PlaceWithRelations, Profile } from "@/lib/types";

const PLACE_SELECT = "*, category:categories(*), chapter:chapters(id, title, slug)";

// Les requêtes de lecture renvoient des listes vides si la base n'est pas encore initialisée,
// afin que le guide reste navigable pendant la mise en place.

export async function getChapters(): Promise<Chapter[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("chapters").select("*").order("order_index");
  return (data as Chapter[] | null) ?? [];
}

// cache() : dédoublonne l'appel entre generateMetadata, opengraph-image et la page.
export const getChapterBySlug = cache(async (slug: string): Promise<Chapter | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("chapters").select("*").eq("slug", slug).maybeSingle();
  return data as Chapter | null;
});

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return (data as Category[] | null) ?? [];
}

export async function getPlaces(filter?: { chapterId?: string; ids?: string[] }): Promise<PlaceWithRelations[]> {
  const supabase = await createClient();
  if (filter?.ids?.length === 0) return [];
  const run = (orderColumn: "sort_order" | "is_featured") => {
    let query = supabase
      .from("places")
      .select(PLACE_SELECT)
      .order(orderColumn, { ascending: orderColumn === "sort_order" })
      .order("title");
    if (filter?.chapterId) query = query.eq("chapter_id", filter.chapterId);
    if (filter?.ids) query = query.in("id", filter.ids);
    return query;
  };
  // Ordre éditorial (/admin/ordre) ; repli sur « coups de cœur d'abord » tant que la migration 003 n'est pas passée.
  let { data, error } = await run("sort_order");
  if (error?.code === "42703") ({ data, error } = await run("is_featured"));
  return (data as PlaceWithRelations[] | null) ?? [];
}

export const getPlaceBySlug = cache(async (slug: string): Promise<PlaceWithRelations | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("places").select(PLACE_SELECT).eq("slug", slug).maybeSingle();
  return data as PlaceWithRelations | null;
});

export async function getPlaceById(id: string): Promise<PlaceWithRelations | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("places").select(PLACE_SELECT).eq("id", id).maybeSingle();
  return data as PlaceWithRelations | null;
}

export async function getSession(): Promise<{ user: { id: string; email?: string } | null; profile: Profile | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { user: { id: user.id, email: user.email }, profile: profile as Profile | null };
}

export async function getFavoriteIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("favorites").select("place_id").eq("user_id", user.id).order("created_at");
  return (data ?? []).map((f: { place_id: string }) => f.place_id);
}

export async function getItinerary(id: string): Promise<CustomItinerary | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("custom_itineraries").select("*").eq("id", id).maybeSingle();
  return data as CustomItinerary | null;
}

export async function getMyItineraries(): Promise<CustomItinerary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("custom_itineraries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data as CustomItinerary[] | null) ?? [];
}

/** Lieux dans l'ordre exact des identifiants fournis (favoris, étapes d'itinéraire). */
export async function getPlacesInOrder(ids: string[]): Promise<PlaceWithRelations[]> {
  const places = await getPlaces({ ids });
  const byId = new Map(places.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is PlaceWithRelations => !!p);
}
