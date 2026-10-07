import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CarnetActions } from "@/components/carnet/carnet-actions";
import { CarnetBoard } from "@/components/carnet/carnet-board";
import { FAVORITES_TITLE } from "@/lib/constants";
import { getItinerary, getPlacesInOrder } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";


type Props = { params: Promise<{ id: string }> };

const UUID = /^[0-9a-f-]{36}$/i;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const itinerary = UUID.test(id) ? await getItinerary(id) : null;
  if (!itinerary) return {};
  const { t } = await getI18n();
  return { title: itinerary.title === FAVORITES_TITLE ? t.carnet.favoritesTitle : itinerary.title };
}

// RLS : visible si public, ou par son auteur.
export default async function CarnetPage({ params }: Props) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const itinerary = await getItinerary(id);
  if (!itinerary) notFound();

  const [places, { t }] = await Promise.all([getPlacesInOrder(itinerary.place_ids), getI18n()]);
  // Le carnet de favoris est stocké sous un titre fixe (clé) : traduit à l'affichage.
  const title = itinerary.title === FAVORITES_TITLE ? t.carnet.favoritesTitle : itinerary.title;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <header className="mb-8 flex flex-col gap-6 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">
            {t.carnet.shared(places.length)}
          </p>
          <h1 className="mt-2 font-display text-[clamp(2.25rem,10vw,3rem)] leading-[1] text-balance break-words md:text-7xl">{title}</h1>
        </div>
        {itinerary.is_public && <CarnetActions title={title} places={places} itineraryId={itinerary.id} />}
      </header>
      <CarnetBoard places={places} route />
    </div>
  );
}
