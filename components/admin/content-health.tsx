import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { MIN_PHOTOS } from "@/lib/photos/enrich";
import { createClient } from "@/lib/supabase/server";
import type { PlaceWithRelations } from "@/lib/types";

/** Compte exact sans rapatrier les lignes ; `null` si la table est inaccessible. */
async function count(table: "profiles" | "custom_itineraries", publicOnly = false) {
  const supabase = await createClient();
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (publicOnly) query = query.eq("is_public", true);
  const { count: n, error } = await query;
  return error ? null : n;
}

/** Tableau de bord du back-office : chiffres clés + fiches à compléter (photos, anglais, conseil du local…). */
export async function ContentHealth({ places }: { places: PlaceWithRelations[] }) {
  const [members, publicNotebooks] = await Promise.all([count("profiles"), count("custom_itineraries", true)]);

  const todo = [
    { label: `Moins de ${MIN_PHOTOS} photos`, items: places.filter((p) => p.images.length < MIN_PHOTOS) },
    { label: "Sans version anglaise", items: places.filter((p) => !p.title_en?.trim() || (p.description && !p.description_en?.trim())) },
    { label: "Sans conseil du local", items: places.filter((p) => !p.local_tip?.trim()) },
    { label: "Sans description", items: places.filter((p) => !p.description?.trim()) },
    { label: "Sans adresse postale", items: places.filter((p) => !p.address?.trim()) },
  ];

  const stats = [
    { label: "Spots", value: places.length },
    { label: "Coups de cœur", value: places.filter((p) => p.is_featured).length },
    { label: "Inscrits", value: members },
    { label: "Carnets partagés", value: publicNotebooks },
  ];

  return (
    <section className="mb-8 space-y-4">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-card p-4">
            <dt className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">{label}</dt>
            <dd className="mt-1 font-display text-4xl">{value ?? "—"}</dd>
          </div>
        ))}
      </dl>

      <div className="rounded-3xl border border-line bg-card">
        <p className="border-b border-line px-4 py-3 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
          À compléter
        </p>
        <ul className="divide-y divide-line">
          {todo.map(({ label, items }) => (
            <li key={label}>
              {items.length === 0 ? (
                <p className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
                  {label}
                  <span className="text-emerald-500">✓ tout est bon</span>
                </p>
              ) : (
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm">
                    {label}
                    <span className="flex items-center gap-2">
                      <span className="rounded-full bg-ocre/15 px-2.5 py-0.5 font-mono text-xs text-ocre">{items.length}</span>
                      <ChevronDown className="size-4 text-muted-foreground transition-transform duration-150 group-open:rotate-180" />
                    </span>
                  </summary>
                  <div className="flex flex-wrap gap-2 px-4 pb-4">
                    {items.map((p) => (
                      <Link
                        key={p.id}
                        href={`/admin/lieux/${p.id}`}
                        className="rounded-full border border-line px-3 py-1 text-xs transition-colors duration-100 hover:border-ocre/60 hover:text-foreground"
                      >
                        {p.title}
                      </Link>
                    ))}
                  </div>
                </details>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
