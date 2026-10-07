import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CategoryShowcase, type ShowcaseItem } from "@/components/home/category-showcase";
import { Hero } from "@/components/home/hero";
import { ItineraryGenerator } from "@/components/home/itinerary-generator";
import { PlaceCard } from "@/components/place-card";
import { EmptyState, SectionHeading } from "@/components/section-heading";
import { CATEGORY_SHOWCASE } from "@/lib/constants";
import { getCategories, getPlaces } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";

export default async function HomePage() {
  const [categories, places, { t }] = await Promise.all([getCategories(), getPlaces(), getI18n()]);

  // Une tuile illustrée par type de lieu (catégories vides masquées).
  const showcase: ShowcaseItem[] = CATEGORY_SHOWCASE.flatMap(({ slug, title, tagline }) => {
    const category = categories.find((c) => c.slug === slug);
    const count = places.filter((p) => p.category?.slug === slug).length;
    const text = t.showcase[slug] ?? { title, tagline };
    return category && count > 0 ? [{ category, title: text.title, tagline: text.tagline, count }] : [];
  });
  const featured = places.filter((p) => p.is_featured).slice(0, 6);

  return (
    <>
      <Hero stats={{ places: places.length, free: places.filter((p) => p.is_free).length, categories: showcase.length }} />

      <div className="mx-auto max-w-7xl space-y-24 px-4 py-16 md:px-8 md:py-24">
        <section id="envies">
          <SectionHeading
            kicker={t.home.showcaseKicker}
            title={<>{t.home.showcaseTitle[0]}<span className="italic text-muted-foreground">{t.home.showcaseTitle[1]}</span></>}
          />
          {showcase.length > 0 ? (
            <CategoryShowcase items={showcase} />
          ) : (
            <EmptyState>{t.home.showcaseEmpty}</EmptyState>
          )}
        </section>

        <section>
          <ItineraryGenerator places={places} />
        </section>

        {featured.length > 0 && (
          <section>
            <SectionHeading
              kicker={t.home.featuredKicker}
              title={<>{t.home.featuredTitle[0]}<span className="italic text-muted-foreground">{t.home.featuredTitle[1]}</span></>}
              action={
                <Link
                  href="/explorer"
                  className="hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-100 hover:text-foreground sm:flex"
                >
                  {t.home.exploreAll} <ArrowRight className="size-4" />
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
          <p className="font-display text-lg text-foreground">Nice<span className="text-ocre">.</span> {t.brand.tagline}</p>
          <p>
            {t.brand.footer} ·{" "}
            <Link href="/confidentialite" className="underline underline-offset-2 hover:text-foreground">
              {t.brand.privacy}
            </Link>
          </p>
        </div>
      </footer>
    </>
  );
}
