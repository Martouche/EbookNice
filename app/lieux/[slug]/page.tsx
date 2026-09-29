import { ArrowLeft, Clock, Download, MapPin, Navigation, Quote, Ticket } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryIcon } from "@/components/category-icon";
import { FavoriteButton } from "@/components/favorite-button";
import { AudioTip } from "@/components/place/audio-tip";
import { PhotoGallery } from "@/components/place/photo-gallery";
import { PlaceMiniMap } from "@/components/place/place-mini-map";
import { PlaceCard } from "@/components/place-card";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BEST_TIME_LABELS, CATEGORY_SHOWCASE, priceLabel } from "@/lib/constants";
import { getPlaceBySlug, getPlaces } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const place = await getPlaceBySlug((await params).slug);
  if (!place) return {};
  const description =
    place.description ?? place.local_tip ?? `${place.category?.name ?? "Spot"} à ${place.city}, sélectionné par les locaux.`;
  // L'image OpenGraph est générée par ./opengraph-image.tsx (photo HD ou couverture typographique).
  return {
    title: place.title,
    description,
    alternates: { canonical: `/lieux/${place.slug}` },
    openGraph: { type: "article", title: place.title, description, url: `/lieux/${place.slug}` },
    twitter: { card: "summary_large_image", title: place.title, description },
  };
}

export default async function PlacePage({ params }: Props) {
  const place = await getPlaceBySlug((await params).slug);
  if (!place) notFound();

  // Même type de lieu (plages, points de vue…) : la navigation suit les « envies » de l'accueil.
  const categoryTitle = CATEGORY_SHOWCASE.find((c) => c.slug === place.category?.slug)?.title ?? place.category?.name;
  const related = place.category
    ? (await getPlaces()).filter((p) => p.category?.slug === place.category?.slug && p.id !== place.id).slice(0, 3)
    : [];

  const destination = `${place.lat},${place.lng}`;
  const googleMaps = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  const waze = `https://waze.com/ul?ll=${destination}&navigate=yes`;

  return (
    <article className="mx-auto max-w-7xl px-4 pt-4 pb-10 md:px-8 md:pt-8">
      <Link
        href={place.category ? `/explorer?category=${place.category.slug}` : "/explorer"}
        className="mb-4 hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-100 hover:text-foreground md:inline-flex"
      >
        <ArrowLeft className="size-4" />
        {categoryTitle ?? "Explorer"}
      </Link>

      <PhotoGallery
        images={place.images}
        credits={place.image_credits}
        title={place.title}
        category={place.category}
        actions={
          <>
            <ShareButton title={place.title} text={place.local_tip ?? place.description ?? undefined} className="size-11" />
            <FavoriteButton placeId={place.id} className="size-11" />
          </>
        }
      />

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_340px] md:gap-14 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {place.is_free && <Badge variant="free">Gratuit · FREE</Badge>}
            {place.category && (
              <Badge>
                <CategoryIcon icon={place.category.icon} />
                {place.category.name}
              </Badge>
            )}
            {place.tags.map((tag) => (
              <Link key={tag} href={`/explorer?tags=${encodeURIComponent(tag)}`}>
                <Badge className="bg-transparent text-muted-foreground transition-colors duration-100 hover:text-foreground">{tag}</Badge>
              </Link>
            ))}
          </div>

          <h1 className="mt-5 font-display text-[clamp(2.5rem,11vw,3rem)] leading-[0.98] tracking-tight text-balance break-words md:text-7xl">{place.title}</h1>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 text-ocre" />
            {place.address ? `${place.address}, ${place.city}` : place.city}
          </p>

          {place.description && (
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-foreground">
              {place.description}
            </p>
          )}

          {place.local_tip && (
            <aside className="relative mt-10 rounded-3xl border border-ocre/30 bg-ocre/10 p-6">
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

          <section className="mt-10">
            <div className="h-72 overflow-hidden rounded-[2rem] border border-line md:h-96">
              <PlaceMiniMap places={[place]} />
            </div>
            <p className="mt-2 text-right font-mono text-[10px] tracking-wider text-muted-foreground">
              {place.lat.toFixed(5)}, {place.lng.toFixed(5)}
            </p>
          </section>
        </div>

        {/* Carte d'action : collante sur desktop */}
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="rounded-[1.75rem] border border-line bg-card p-5">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line text-sm">
              <div className="bg-card p-3">
                <dt className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                  <Ticket className="size-3" /> Prix
                </dt>
                <dd className="mt-1 font-medium">{place.is_free ? "Gratuit" : priceLabel(place.price_level)}</dd>
              </div>
              <div className="bg-card p-3">
                <dt className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                  <Clock className="size-3" /> Moment
                </dt>
                <dd className="mt-1 font-medium">{BEST_TIME_LABELS[place.best_time_to_visit]}</dd>
              </div>
            </dl>

            <div className="mt-4 grid gap-2">
              <Button asChild variant="accent" size="lg">
                <a href={googleMaps} target="_blank" rel="noopener noreferrer">
                  <Navigation />
                  Y aller avec Google Maps
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={waze} target="_blank" rel="noopener noreferrer">
                  <Navigation />
                  Waze
                </a>
              </Button>
              {place.gpx_url && (
                <Button asChild variant="outline" size="lg">
                  <a href={place.gpx_url} download>
                    <Download />
                    Télécharger le tracé GPX
                  </a>
                </Button>
              )}
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Dans la même envie</p>
          <h2 className="mt-2 mb-6 font-display text-4xl">{categoryTitle}</h2>
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
