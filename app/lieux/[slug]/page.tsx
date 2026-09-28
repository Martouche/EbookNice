import { ArrowLeft, Clock, Download, MapPin, Navigation, Quote } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryIcon } from "@/components/category-icon";
import { FavoriteButton } from "@/components/favorite-button";
import { AudioTip } from "@/components/place/audio-tip";
import { PhotoCarousel } from "@/components/place/photo-carousel";
import { PlaceMiniMap } from "@/components/place/place-mini-map";
import { PlaceCard } from "@/components/place-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BEST_TIME_LABELS, priceLabel } from "@/lib/constants";
import { getPlaceBySlug, getPlaces } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const place = await getPlaceBySlug((await params).slug);
  if (!place) return {};
  return {
    title: place.title,
    description: place.description ?? undefined,
    openGraph: place.images[0] ? { images: [place.images[0]] } : undefined,
  };
}

export default async function PlacePage({ params }: Props) {
  const place = await getPlaceBySlug((await params).slug);
  if (!place) notFound();

  const related = place.chapter_id
    ? (await getPlaces({ chapterId: place.chapter_id })).filter((p) => p.id !== place.id).slice(0, 3)
    : [];

  const destination = `${place.lat},${place.lng}`;
  const googleMaps = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  const waze = `https://waze.com/ul?ll=${destination}&navigate=yes`;

  return (
    <article className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <Link
        href={place.chapter ? `/chapitres/${place.chapter.slug}` : "/explorer"}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-100 hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {place.chapter?.title ?? "Explorer"}
      </Link>

      <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:gap-12">
        <div className="relative">
          <PhotoCarousel images={place.images} title={place.title} category={place.category} />
          <FavoriteButton placeId={place.id} className="absolute top-4 right-4 size-11" />
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            {place.is_free && <Badge variant="free">Gratuit · FREE</Badge>}
            {place.category && (
              <Badge>
                <CategoryIcon icon={place.category.icon} />
                {place.category.name}
              </Badge>
            )}
            {place.tags.map((tag) => (
              <Badge key={tag} className="bg-transparent text-muted-foreground">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="mt-5 font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">{place.title}</h1>

          <dl className="mt-6 grid grid-cols-3 divide-x divide-line border-y border-line text-sm">
            <div className="py-3 pr-3">
              <dt className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Prix</dt>
              <dd className="mt-1 font-medium">{priceLabel(place.price_level)}</dd>
            </div>
            <div className="px-3 py-3">
              <dt className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Moment</dt>
              <dd className="mt-1 flex items-center gap-1.5 font-medium">
                <Clock className="size-3.5 text-ocre" />
                {BEST_TIME_LABELS[place.best_time_to_visit]}
              </dd>
            </div>
            <div className="py-3 pl-3">
              <dt className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Ville</dt>
              <dd className="mt-1 font-medium">{place.city}</dd>
            </div>
          </dl>

          {place.description && (
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-foreground">
              {place.description}
            </p>
          )}

          {place.local_tip && (
            <aside className="relative mt-8 rounded-3xl border border-ocre/30 bg-ocre/10 p-6">
              <Badge variant="accent" className="absolute -top-3 left-5 bg-background">
                <Quote />
                Conseil du Local
              </Badge>
              <p className="font-display text-2xl leading-snug italic">« {place.local_tip} »</p>
            </aside>
          )}

          {place.audio_tip_url && (
            <div className="mt-4">
              <AudioTip src={place.audio_tip_url} />
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            <Button asChild variant="accent">
              <a href={googleMaps} target="_blank" rel="noopener noreferrer">
                <Navigation />
                Google Maps
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={waze} target="_blank" rel="noopener noreferrer">
                <Navigation />
                Waze
              </a>
            </Button>
            {place.gpx_url && (
              <Button asChild variant="outline">
                <a href={place.gpx_url} download>
                  <Download />
                  Tracé GPX
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 text-ocre" />
          {place.address ? `${place.address}, ${place.city}` : place.city}
          <span className="ml-auto font-mono text-[10px] tracking-wider">
            {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
          </span>
        </div>
        <div className="h-72 overflow-hidden rounded-[2rem] border border-line md:h-96">
          <PlaceMiniMap places={[place]} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Dans le même chapitre</p>
          <h2 className="mt-2 mb-6 font-display text-4xl">{place.chapter?.title}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PlaceCard key={p.id} place={p} compact />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
