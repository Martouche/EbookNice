import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CarnetActions } from "@/components/carnet/carnet-actions";
import { CarnetBoard } from "@/components/carnet/carnet-board";
import { getItinerary, getPlacesInOrder } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

const UUID = /^[0-9a-f-]{36}$/i;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const itinerary = UUID.test(id) ? await getItinerary(id) : null;
  return itinerary ? { title: itinerary.title } : {};
}

// RLS : visible si public, ou par son auteur.
export default async function CarnetPage({ params }: Props) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const itinerary = await getItinerary(id);
  if (!itinerary) notFound();

  const places = await getPlacesInOrder(itinerary.place_ids);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <header className="mb-8 flex flex-col gap-6 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">
            Carnet partagé · {places.length} étape{places.length > 1 ? "s" : ""}
          </p>
          <h1 className="mt-2 font-display text-5xl leading-none md:text-7xl">{itinerary.title}</h1>
        </div>
        {itinerary.is_public && <CarnetActions title={itinerary.title} places={places} itineraryId={itinerary.id} />}
      </header>
      <CarnetBoard places={places} route />
    </div>
  );
}
