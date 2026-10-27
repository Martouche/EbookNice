/**
 * Retour arrière d'une exécution de scripts/optimize-photos.ts.
 *
 *   npx tsx scripts/restore-photos.ts                         → liste les sauvegardes disponibles
 *   npx tsx scripts/restore-photos.ts --stamp=<horodatage>    → simulation du retour arrière
 *   npx tsx scripts/restore-photos.ts --stamp=<horodatage> --apply
 *   npx tsx scripts/restore-photos.ts --stamp=<horodatage> --slug=chez-pipo --apply   → un seul lieu
 *
 * Remet les fichiers archivés à leur emplacement d'origine, restaure `images` et `image_credits` des fiches
 * tels qu'ils étaient, puis archive à leur tour les versions optimisées (rien n'est supprimé).
 * Requiert SUPABASE_SERVICE_ROLE_KEY dans .env.local.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { ImageCredit } from "../lib/types";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Variables déjà présentes dans l'environnement.
}

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const option = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const stamp = option("stamp");
const onlySlug = option("slug");

const BUCKET = "places-images";
const ARCHIVE = "_archive";
const SNAPSHOTS = "supabase/photo-snapshots";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("✗ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis dans .env.local.");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const storage = supabase.storage.from(BUCKET);

type Snapshot = { stamp: string; places: { id: string; slug: string; images: string[]; image_credits: ImageCredit[] | null }[] };

async function main() {
  if (!stamp) {
    console.log("Sauvegardes disponibles :");
    if (existsSync(SNAPSHOTS)) {
      readdirSync(SNAPSHOTS).sort().reverse().forEach((f) => console.log(`  --stamp=${f.replace(/^photos-|\.json$/g, "")}`));
    }
    return;
  }

  const file = `${SNAPSHOTS}/photos-${stamp}.json`;
  if (!existsSync(file)) throw new Error(`sauvegarde introuvable : ${file}`);
  const snapshot = JSON.parse(readFileSync(file, "utf8")) as Snapshot;
  const later = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  console.log(`${apply ? "Retour arrière" : "Simulation (ajoutez --apply)"} vers l'état du ${stamp}\n`);
  for (const place of snapshot.places.filter((p) => !onlySlug || p.slug === onlySlug)) {
    console.log(`▸ ${place.slug} : ${place.images.length} photo(s) d'origine`);
    if (!apply) continue;

    // 1. Versions optimisées actuelles → archive (pour pouvoir y revenir aussi).
    const { data: current } = await storage.list(place.slug, { limit: 1000 });
    for (const f of (current ?? []).filter((f) => f.id)) {
      await storage.move(`${place.slug}/${f.name}`, `${ARCHIVE}/${later}-annule/${place.slug}/${f.name}`);
    }
    // 2. Fichiers d'origine → emplacement initial.
    const { data: archived } = await storage.list(`${ARCHIVE}/${stamp}/${place.slug}`, { limit: 1000 });
    for (const f of (archived ?? []).filter((f) => f.id)) {
      const { error: mvError } = await storage.move(`${ARCHIVE}/${stamp}/${place.slug}/${f.name}`, `${place.slug}/${f.name}`);
      if (mvError) console.warn(`   ⚠ ${f.name} : ${mvError.message}`);
    }
    // 3. Fiche telle qu'elle était.
    const { error: upError } = await supabase
      .from("places")
      .update({ images: place.images, image_credits: place.image_credits })
      .eq("id", place.id);
    if (upError) console.error(`   ✗ fiche : ${upError.message}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
