import { Compass } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CarnetActions } from "@/components/carnet/carnet-actions";
import { CarnetBoard } from "@/components/carnet/carnet-board";
import { EmptyState } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { getFavoriteIds, getPlacesInOrder } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.meta.favorites };
}

export default async function FavoritesPage() {
  const [places, { t }] = await Promise.all([getFavoriteIds().then(getPlacesInOrder), getI18n()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <header className="mb-8 flex flex-col gap-6 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">{t.carnet.kicker}</p>
          <h1 className="mt-2 font-display text-[clamp(2.5rem,11vw,3.75rem)] leading-[1] text-balance break-words md:text-7xl">
            {t.carnet.title[0]}<span className="italic text-muted-foreground">{t.carnet.title[1]}</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {t.carnet.saved(places.length)}
          </p>
        </div>
        <CarnetActions title={t.carnet.favoritesTitle} places={places} />
      </header>

      {places.length === 0 ? (
        <EmptyState>
          <p>{t.carnet.empty}</p>
          <Button asChild variant="accent" className="mt-6">
            <Link href="/explorer">
              <Compass />
              {t.carnet.exploreGuide}
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <CarnetBoard places={places} editable />
      )}
    </div>
  );
}
