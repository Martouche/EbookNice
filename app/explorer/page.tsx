import type { Metadata } from "next";
import { Explorer } from "@/components/explorer/explorer";
import { getCategories, getPlaces } from "@/lib/data";

export const metadata: Metadata = { title: "Explorer" };

const list = (value: string | string[] | undefined) =>
  typeof value === "string" && value ? value.split(",").filter(Boolean) : [];

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, places, categories] = await Promise.all([searchParams, getPlaces(), getCategories()]);

  return (
    <Explorer
      places={places}
      categories={categories}
      initialView={params.vue === "carte" ? "carte" : "liste"}
      initialFilters={{
        q: typeof params.q === "string" ? params.q : "",
        free: params.gratuit === "1",
        categories: list(params.categorie),
        prices: list(params.prix).map(Number).filter((n) => n >= 0 && n <= 4),
        tags: list(params.tags),
      }}
    />
  );
}
