/**
 * Enrichit automatiquement les spots en photos HD (Wikimedia Commons, + Unsplash / Pexels si clés).
 *
 *   npx tsx scripts/enrich-photos.ts              → spots avec moins de 3 photos, complétés jusqu'à 5
 *   npx tsx scripts/enrich-photos.ts --dry-run    → simulation, aucune écriture
 *   npx tsx scripts/enrich-photos.ts --all        → aussi les spots ayant déjà 3-4 photos
 *   npx tsx scripts/enrich-photos.ts --slug=chez-pipo --limit=5
 *
 * Requiert SUPABASE_SERVICE_ROLE_KEY dans .env.local (écriture Storage + table places hors session admin).
 */
import { createClient } from "@supabase/supabase-js";
import { ENRICH_SELECT, MAX_PHOTOS, MIGRATION_HINT, MIN_PHOTOS, enrichPlace, isMissingColumn, type EnrichablePlace } from "../lib/photos/enrich";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Variables déjà présentes dans l'environnement (CI).
}

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];

const dryRun = flag("dry-run");
const threshold = flag("all") ? MAX_PHOTOS : MIN_PHOTOS;
const limit = Number(option("limit") ?? Infinity);
const slug = option("slug");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("✗ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (.env.local).");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const c = { dim: "\x1b[2m", green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m", bold: "\x1b[1m", reset: "\x1b[0m" };

async function main() {
  let query = supabase.from("places").select(ENRICH_SELECT).order("title");
  if (slug) query = query.eq("slug", slug);
  const { data, error } = await query;
  if (error) throw new Error(isMissingColumn(error) ? MIGRATION_HINT : error.message);

  const places = (data as unknown as EnrichablePlace[])
    .filter((p) => p.images.length < threshold)
    .slice(0, limit);

  const providers = ["Wikimedia Commons", process.env.UNSPLASH_ACCESS_KEY && "Unsplash", process.env.PEXELS_API_KEY && "Pexels"].filter(Boolean);
  console.log(`${c.bold}Enrichissement photos${c.reset} ${c.dim}· ${providers.join(" + ")}${dryRun ? " · simulation" : ""}${c.reset}`);
  console.log(`${c.dim}${places.length} spot(s) à traiter sur ${data.length}${c.reset}\n`);

  let added = 0;
  let enriched = 0;
  let fallbacks = 0;
  const failures: string[] = [];

  for (const [i, place] of places.entries()) {
    const prefix = `${c.dim}[${String(i + 1).padStart(2)}/${places.length}]${c.reset}`;
    const result = await enrichPlace(supabase, place, { target: MAX_PHOTOS, dryRun });
    if (result.error && result.added === 0) {
      failures.push(place.title);
      console.log(`${prefix} ${c.red}✗${c.reset} ${place.title} ${c.dim}— ${result.error}${c.reset}`);
      continue;
    }
    added += result.added;
    if (result.added > 0) enriched++;
    if (result.usedFallback) fallbacks++;
    const total = place.images.length + result.added;
    console.log(
      `${prefix} ${c.green}✓${c.reset} ${place.title} ${c.dim}+${result.added} → ${total} photo(s)${result.usedFallback ? " · fallback catégorie" : ""}${c.reset}`,
    );
    for (const line of result.preview ?? []) console.log(`       ${c.dim}· ${line}${c.reset}`);
  }

  console.log(
    `\n${c.bold}${places.length} lieu(x) analysé(s), ${added} photo(s) ${dryRun ? "trouvée(s)" : "ajoutée(s)"} sur ${enriched} spot(s).${c.reset}`,
  );
  if (fallbacks) console.log(`${c.yellow}${fallbacks} spot(s) complété(s) avec des photos génériques de catégorie — à vérifier dans /admin.${c.reset}`);
  if (failures.length) console.log(`${c.red}Sans photo : ${failures.join(", ")}${c.reset}`);
}

main().catch((e) => {
  console.error(`${c.red}✗ ${e instanceof Error ? e.message : e}${c.reset}`);
  process.exit(1);
});
