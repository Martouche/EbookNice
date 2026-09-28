"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BestTime } from "@/lib/types";
import { slugify } from "@/lib/utils";

export interface FormState {
  error?: string;
}

const BEST_TIMES: BestTime[] = ["SUNSET", "MORNING", "AFTERNOON", "NIGHT", "ANYTIME"];

/** Double verrou : contrôle applicatif ici, RLS `is_admin()` côté base. */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/admin");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "ADMIN") redirect("/");
  return supabase;
}

const text = (fd: FormData, key: string) => {
  const value = String(fd.get(key) ?? "").trim();
  return value || null;
};

const jsonArray = (fd: FormData, key: string): string[] => {
  try {
    const parsed = JSON.parse(String(fd.get(key) ?? "[]"));
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string" && v.length > 0) : [];
  } catch {
    return [];
  }
};

export async function savePlace(_: FormState, fd: FormData): Promise<FormState> {
  const supabase = await requireAdmin();
  const id = text(fd, "id");
  const title = text(fd, "title");
  const lat = Number(fd.get("lat"));
  const lng = Number(fd.get("lng"));
  const priceLevel = Number(fd.get("price_level"));
  const bestTime = String(fd.get("best_time_to_visit")) as BestTime;

  if (!title) return { error: "Le titre est obligatoire." };
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { error: "Cliquez sur la carte pour placer le spot." };
  if (!(priceLevel >= 0 && priceLevel <= 4)) return { error: "Niveau de prix invalide." };

  const payload = {
    title,
    slug: slugify(text(fd, "slug") ?? title),
    description: text(fd, "description"),
    chapter_id: text(fd, "chapter_id"),
    category_id: text(fd, "category_id"),
    address: text(fd, "address"),
    city: text(fd, "city") ?? "Nice",
    lat,
    lng,
    price_level: priceLevel,
    local_tip: text(fd, "local_tip"),
    audio_tip_url: text(fd, "audio_tip_url"),
    gpx_url: text(fd, "gpx_url"),
    images: jsonArray(fd, "images"),
    tags: jsonArray(fd, "tags"),
    best_time_to_visit: BEST_TIMES.includes(bestTime) ? bestTime : "ANYTIME",
    is_featured: fd.get("is_featured") === "on",
  };

  const { error } = id
    ? await supabase.from("places").update(payload).eq("id", id)
    : await supabase.from("places").insert(payload);

  if (error) {
    return { error: error.code === "23505" ? "Ce slug est déjà utilisé par un autre spot." : error.message };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function deletePlace(id: string) {
  const supabase = await requireAdmin();
  await supabase.from("places").delete().eq("id", id);
  revalidatePath("/", "layout");
}

export async function saveChapter(fd: FormData) {
  const supabase = await requireAdmin();
  const id = text(fd, "id");
  const title = text(fd, "title");
  if (!title) return;

  const payload = {
    title,
    slug: slugify(text(fd, "slug") ?? title),
    description: text(fd, "description"),
    cover_image: text(fd, "cover_image"),
    order_index: Number(fd.get("order_index")) || 0,
  };

  if (id) await supabase.from("chapters").update(payload).eq("id", id);
  else await supabase.from("chapters").insert(payload);
  revalidatePath("/", "layout");
}

export async function deleteChapter(id: string) {
  const supabase = await requireAdmin();
  await supabase.from("chapters").delete().eq("id", id);
  revalidatePath("/", "layout");
}
