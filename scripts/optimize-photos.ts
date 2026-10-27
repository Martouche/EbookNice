/**
 * Renomme, compresse et réindexe les photos des lieux (Supabase Storage + table places).
 *
 *   npx tsx scripts/optimize-photos.ts                → simulation : affiche le plan, n'écrit rien
 *   npx tsx scripts/optimize-photos.ts --apply        → exécute
 *   npx tsx scripts/optimize-photos.ts --slug=chez-pipo --apply
 *   npx tsx scripts/optimize-photos.ts --upscaled=<dossier> --apply
 *        → utilise les versions agrandies `<slug>__<index>.<ext>` de ce dossier à la place des originaux
 *
 * Pour chaque photo, dans l'ordre de la fiche :
 *  - orientation corrigée, métadonnées EXIF supprimées (dont la position GPS du téléphone) ;
 *  - 2000 px maximum sur le grand côté (jamais agrandie ici), WebP qualité 76 (65 si la source était plus légère) ;
 *  - nom lisible et stable : `<slug>/<slug>-01-<empreinte>.webp` (l'empreinte du contenu évite les caches périmés) ;
 * puis la fiche est mise à jour (ordre conservé, crédits Wikimedia remappés, crédits orphelins retirés)
 * et les anciens fichiers du dossier du lieu sont supprimés. Déjà optimisée = ignorée (relance sans effet).
 *
 * Requiert SUPABASE_SERVICE_ROLE_KEY dans .env.local (jamais commitée, jamais sur Vercel).
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import type { ImageCredit } from "../lib/types";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Variables déjà présentes dans l'environnement.
}

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const option = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const onlySlug = option("slug");
const upscaledDir = option("upscaled");

const BUCKET = "places-images";
// 2000 px couvrent la lightbox plein écran ; next/image sert ensuite la taille exacte de chaque appareil.
const MAX_SIDE = 2000;
const QUALITY = 76;
/** Source déjà très compressée : on baisse la qualité plutôt que d'alourdir le fichier. */
const QUALITY_FALLBACK = 65;
const OPTIMIZED = /\/([a-z0-9-]+)-\d{2}-[0-9a-f]{8}\.webp$/;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("✗ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis dans .env.local.");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const publicPrefix = `${url}/storage/v1/object/public/${BUCKET}/`;

type Place = { id: string; slug: string; images: string[]; image_credits: ImageCredit[] | null };

/** Version agrandie fournie localement (`<slug>__<index>.*`), sinon l'original téléchargé. */
async function source(place: Place, index: number, imageUrl: string) {
  if (upscaledDir) {
    const local = readdirSync(upscaledDir).find((f) => f.startsWith(`${place.slug}__${index}.`));
    if (local) return { buffer: readFileSync(path.join(upscaledDir, local)), upscaled: true };
  }
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`téléchargement ${res.status} : ${imageUrl}`);
  return { buffer: Buffer.from(await res.arrayBuffer()), upscaled: false };
}

async function processPlace(place: Place) {
  const isDone = place.images.every((u, i) => OPTIMIZED.test(u) && u.includes(`/${place.slug}-${String(i + 1).padStart(2, "0")}-`));
  if (isDone && !upscaledDir) return { skipped: true, before: 0, after: 0 };

  let before = 0;
  let after = 0;
  const next: { oldUrl: string; newUrl: string; path: string; body: Buffer }[] = [];

  for (const [i, oldUrl] of place.images.entries()) {
    const { buffer, upscaled } = await source(place, i, oldUrl);
    before += buffer.length;
    const encode = (quality: number) =>
      sharp(buffer)
        .rotate()
        .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toBuffer();
    let body = await encode(QUALITY);
    if (body.length > buffer.length && !upscaled) body = await encode(QUALITY_FALLBACK);
    after += body.length;
    const hash = createHash("sha1").update(body).digest("hex").slice(0, 8);
    const filePath = `${place.slug}/${place.slug}-${String(i + 1).padStart(2, "0")}-${hash}.webp`;
    next.push({ oldUrl, newUrl: publicPrefix + filePath, path: filePath, body });
    const meta = await sharp(body).metadata();
    console.log(`   ${String(i + 1).padStart(2, "0")} ${(buffer.length / 1024).toFixed(0).padStart(5)} Ko → ${(body.length / 1024).toFixed(0).padStart(4)} Ko  ${meta.width}×${meta.height}${upscaled ? "  (agrandie)" : ""}`);
  }

  if (!apply) return { skipped: false, before, after };

  for (const item of next) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(item.path, item.body, { contentType: "image/webp", cacheControl: "31536000", upsert: true });
    if (error) throw new Error(`upload ${item.path} : ${error.message}`);
  }

  // Crédits : uniquement ceux des photos encore présentes, réattachés à leur nouvelle URL.
  const renamed = new Map(next.map((n) => [n.oldUrl, n.newUrl]));
  const credits = (place.image_credits ?? []).flatMap((c) => (renamed.has(c.url) ? [{ ...c, url: renamed.get(c.url)! }] : []));
  const { error } = await supabase
    .from("places")
    .update({ images: next.map((n) => n.newUrl), image_credits: credits })
    .eq("id", place.id);
  if (error) throw new Error(`mise à jour de la fiche : ${error.message}`);

  // Ménage : tout ce qui reste dans le dossier du lieu et n'est plus référencé.
  const { data: files } = await supabase.storage.from(BUCKET).list(place.slug, { limit: 1000 });
  const keep = new Set(next.map((n) => n.path));
  const stale = (files ?? []).map((f) => `${place.slug}/${f.name}`).filter((p) => !keep.has(p));
  if (stale.length) {
    const { error: rmError } = await supabase.storage.from(BUCKET).remove(stale);
    if (rmError) console.warn(`   ⚠ anciens fichiers non supprimés : ${rmError.message}`);
  }
  return { skipped: false, before, after };
}

async function main() {
  if (upscaledDir && !existsSync(upscaledDir)) throw new Error(`dossier introuvable : ${upscaledDir}`);
  let query = supabase.from("places").select("id, slug, images, image_credits").order("sort_order");
  if (onlySlug) query = query.eq("slug", onlySlug);
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  console.log(`${apply ? "Optimisation" : "Simulation (ajoutez --apply pour exécuter)"} · ${data.length} lieu(x)\n`);
  let before = 0;
  let after = 0;
  for (const place of data as Place[]) {
    console.log(`▸ ${place.slug} (${place.images.length} photo(s))`);
    try {
      const r = await processPlace(place);
      if (r.skipped) console.log("   déjà optimisé");
      before += r.before;
      after += r.after;
    } catch (e) {
      console.error(`   ✗ ${(e as Error).message}`);
    }
  }
  console.log(`\nPoids total : ${(before / 1048576).toFixed(1)} Mo → ${(after / 1048576).toFixed(1)} Mo`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
