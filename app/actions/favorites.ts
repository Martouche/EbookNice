"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(placeId: string, favorite: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "AUTH_REQUIRED" as const };

  const { error } = favorite
    ? await supabase.from("favorites").upsert({ user_id: user.id, place_id: placeId })
    : await supabase.from("favorites").delete().eq("user_id", user.id).eq("place_id", placeId);

  if (error) return { error: error.message };
  revalidatePath("/favoris");
  return { ok: true as const };
}
