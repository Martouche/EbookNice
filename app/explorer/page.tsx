import type { Metadata } from "next";
import { Explorer } from "@/components/explorer/explorer";
import { getCategories, getPlaces } from "@/lib/data";
import { parseFilters, serializeFilters } from "@/lib/filters";
import { getI18n, localeAlternates } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.explorerTitle, description: t.meta.explorerDescription, alternates: await localeAlternates("/explorer") };
}

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, places, categories] = await Promise.all([searchParams, getPlaces(), getCategories()]);
  const { filters, view } = parseFilters(params);

  // Remonte l'explorer si l'URL change par navigation (lien, header) ; nos replaceState internes, eux, ne déclenchent pas de rendu serveur.
  return <Explorer key={serializeFilters(filters, view)} places={places} categories={categories} initialFilters={filters} initialView={view} />;
}
