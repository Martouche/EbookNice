import { Compass } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CarnetActions } from "@/components/carnet/carnet-actions";
import { CarnetBoard } from "@/components/carnet/carnet-board";
import { EmptyState } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { getFavoriteIds, getPlacesInOrder } from "@/lib/data";

export const metadata: Metadata = { title: "Mes favoris" };

export default async function FavoritesPage() {
  const places = await getPlacesInOrder(await getFavoriteIds());

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <header className="mb-8 flex flex-col gap-6 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">Carnet de voyage</p>
          <h1 className="mt-2 font-display text-6xl leading-none md:text-7xl">
            Mes <span className="italic text-muted-foreground">favoris</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {places.length} adresse{places.length > 1 ? "s" : ""} gardée{places.length > 1 ? "s" : ""} précieusement
          </p>
        </div>
        <CarnetActions title="Mon carnet de favoris" places={places} />
      </header>

      {places.length === 0 ? (
        <EmptyState>
          <p>Votre carnet est vide. Touchez le cœur d&apos;une adresse pour l&apos;y ajouter.</p>
          <Button asChild variant="accent" className="mt-6">
            <Link href="/explorer">
              <Compass />
              Explorer le guide
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <CarnetBoard places={places} editable />
      )}
    </div>
  );
}
