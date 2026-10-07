import { PlaceForm } from "@/components/admin/place-form";
import { getCategories, getChapters } from "@/lib/data";

export default async function NewPlacePage() {
  const [chapters, categories] = await Promise.all([getChapters({ raw: true }), getCategories({ raw: true })]);

  return (
    <>
      <h1 className="mb-6 font-display text-5xl">Nouveau spot</h1>
      <PlaceForm chapters={chapters} categories={categories} />
    </>
  );
}
