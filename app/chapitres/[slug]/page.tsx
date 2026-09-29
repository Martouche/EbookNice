import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlaceMiniMap } from "@/components/place/place-mini-map";
import { PlaceCard } from "@/components/place-card";
import { EmptyState } from "@/components/section-heading";
import { getChapterBySlug, getChapters, getPlaces } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chapter = await getChapterBySlug((await params).slug);
  return chapter ? { title: chapter.title, description: chapter.description ?? undefined } : {};
}

export default async function ChapterPage({ params }: Props) {
  const chapter = await getChapterBySlug((await params).slug);
  if (!chapter) notFound();

  const [places, chapters] = await Promise.all([getPlaces({ chapterId: chapter.id }), getChapters()]);
  const position = chapters.findIndex((c) => c.id === chapter.id);
  const next = chapters[position + 1];

  return (
    <>
      <header className="relative overflow-hidden border-b border-line">
        {chapter.cover_image && (
          <>
            <Image src={chapter.cover_image} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
            <div className="absolute inset-0 bg-linear-to-t from-background to-background/20" />
          </>
        )}
        <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-12 md:px-8 md:pt-12 md:pb-20">
          <Link
            href="/#envies"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-100 hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Accueil
          </Link>
          <p className="mt-10 font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">
            Chapitre {String(chapter.order_index || position + 1).padStart(2, "0")}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.75rem,12vw,3.75rem)] leading-[0.95] text-balance break-words tracking-tight md:text-8xl">{chapter.title}</h1>
          {chapter.description && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{chapter.description}</p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 md:px-8">
        {places.length === 0 ? (
          <EmptyState>Ce chapitre attend encore ses premières adresses.</EmptyState>
        ) : (
          <>
            <div className="h-64 overflow-hidden rounded-[2rem] border border-line md:h-80">
              <PlaceMiniMap places={places} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place, i) => (
                <PlaceCard key={place.id} place={place} index={i} />
              ))}
            </div>
          </>
        )}

        {next && (
          <Link
            href={`/chapitres/${next.slug}`}
            className="group flex items-end justify-between gap-6 border-t border-line pt-8"
          >
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Chapitre suivant</p>
              <p className="mt-2 font-display text-4xl transition-colors duration-100 group-hover:text-ocre md:text-5xl">
                {next.title}
              </p>
            </div>
            <span className="font-display text-5xl text-muted-foreground transition-transform duration-150 group-hover:translate-x-1">
              →
            </span>
          </Link>
        )}
      </div>
    </>
  );
}
