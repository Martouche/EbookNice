import { notFound } from "next/navigation";
import { PlaceForm } from "@/components/admin/place-form";
import { getCategories, getChapters, getPlaceById } from "@/lib/data";

export default async function EditPlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [place, chapters, categories] = await Promise.all([getPlaceById(id), getChapters(), getCategories()]);
  if (!place) notFound();

  return (
    <>
      <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Modifier</p>
      <h1 className="mt-1 mb-6 font-display text-5xl">{place.title}</h1>
      <PlaceForm place={place} chapters={chapters} categories={categories} />
    </>
  );
}
