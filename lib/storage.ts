import { createClient } from "@/lib/supabase/client";

export type Bucket = "places-images" | "gpx-tracks";

/** Upload direct navigateur → Supabase Storage (policies RLS : admins uniquement). Renvoie l'URL publique. */
export async function uploadToStorage(bucket: Bucket, file: File, folder: string) {
  const supabase = createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const contentType = extension === "gpx" ? "application/gpx+xml" : file.type || undefined;

  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType, upsert: false });
  if (error) throw new Error(error.message);

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
