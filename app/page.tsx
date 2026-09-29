import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ChaptersBento } from "@/components/home/chapters-bento";
import { Hero } from "@/components/home/hero";
import { ItineraryGenerator } from "@/components/home/itinerary-generator";
import { PlaceCard } from "@/components/place-card";
import { EmptyState, SectionHeading } from "@/components/section-heading";
import { getChapters, getPlaces } from "@/lib/data";

export default async function HomePage() {
  const [chapters, places] = await Promise.all([getChapters(), getPlaces()]);

  const counts = places.reduce<Record<string, number>>((acc, p) => {
    if (p.chapter_id) acc[p.chapter_id] = (acc[p.chapter_id] ?? 0) + 1;
    return acc;
  }, {});
  const featured = places.filter((p) => p.is_featured).slice(0, 6);

  return (
    <>
      <Hero stats={{ places: places.length, free: places.filter((p) => p.is_free).length, chapters: chapters.length }} />

      <div className="mx-auto max-w-7xl space-y-24 px-4 py-16 md:px-8 md:py-24">
        <section id="sommaire">
          <SectionHeading kicker="Sommaire" title={<>Les chapitres <span className="italic text-muted-foreground">du guide</span></>} />
          {chapters.length > 0 ? (
            <ChaptersBento chapters={chapters} counts={counts} />
          ) : (
            <EmptyState>
              Le guide est encore vierge. Exécutez <code className="font-mono text-foreground">supabase/schema.sql</code> dans
              le SQL Editor de Supabase pour charger les premiers chapitres.
            </EmptyState>
          )}
        </section>

        <section>
          <ItineraryGenerator places={places} />
        </section>

        {featured.length > 0 && (
          <section>
            <SectionHeading
              kicker="Coups de cœur"
              title={<>Là où l&apos;on <span className="italic text-muted-foreground">emmène les amis</span></>}
              action={
                <Link
                  href="/explorer"
                  className="hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-100 hover:text-foreground sm:flex"
                >
                  Tout explorer <ArrowRight className="size-4" />
                </Link>
              }
            />
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {featured.map((place, i) => (
                <div key={place.id} className="w-[80vw] max-w-sm shrink-0 snap-start sm:w-[45vw] md:w-auto md:max-w-none">
                  <PlaceCard place={place} index={i} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-10 text-xs text-muted-foreground md:flex-row md:justify-between md:px-8">
          <p className="font-display text-lg text-foreground">Nice<span className="text-ocre">.</span> Le guide des locaux</p>
          <p>Fait à Nice, avec amour et un peu de socca.</p>
        </div>
      </footer>
    </>
  );
}
