import { Plus, Save } from "lucide-react";
import { deleteChapter, saveChapter } from "@/app/actions/admin";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { getChapters } from "@/lib/data";
import type { Chapter } from "@/lib/types";

function ChapterFields({ chapter }: { chapter?: Chapter }) {
  return (
    <>
      {chapter && <input type="hidden" name="id" value={chapter.id} />}
      <div className="grid gap-3 md:grid-cols-[5rem_1fr_1fr]">
        <Input name="order_index" type="number" defaultValue={chapter?.order_index ?? ""} placeholder="N°" aria-label="Ordre" />
        <Input name="title" required defaultValue={chapter?.title} placeholder="Titre" aria-label="Titre" />
        <Input name="slug" defaultValue={chapter?.slug} placeholder="slug (auto)" aria-label="Slug" className="font-mono" />
      </div>
      <Textarea name="description" defaultValue={chapter?.description ?? ""} placeholder="Chapô du chapitre" rows={2} aria-label="Description" />
      <Input name="cover_image" type="url" defaultValue={chapter?.cover_image ?? ""} placeholder="URL de couverture (Supabase Storage)" aria-label="Image de couverture" />
    </>
  );
}

export default async function AdminChaptersPage() {
  const chapters = await getChapters();

  return (
    <div className="space-y-4">
      <h1 className="mb-6 font-display text-5xl">Chapitres</h1>

      {chapters.map((chapter) => (
        <div key={chapter.id} className="flex gap-2 rounded-3xl border border-line bg-card p-5">
          <form action={saveChapter} className="flex-1 space-y-3">
            <ChapterFields chapter={chapter} />
            <Button type="submit" size="sm" variant="outline">
              <Save />
              Enregistrer
            </Button>
          </form>
          <ConfirmDelete action={deleteChapter.bind(null, chapter.id)} label={chapter.title} />
        </div>
      ))}

      <form action={saveChapter} className="space-y-3 rounded-3xl border border-dashed border-line-strong p-5">
        <p className="font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">Nouveau chapitre</p>
        <ChapterFields />
        <Button type="submit" size="sm" variant="accent">
          <Plus />
          Ajouter
        </Button>
      </form>
    </div>
  );
}
