import { Pencil, Star } from "lucide-react";
import Link from "next/link";
import { deletePlace } from "@/app/actions/admin";
import { BulkEnrichButton } from "@/components/admin/bulk-enrich-button";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { CategoryIcon } from "@/components/category-icon";
import { EmptyState } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { priceLabel } from "@/lib/constants";
import { getPlaces } from "@/lib/data";
import { MIN_PHOTOS } from "@/lib/photos/enrich";

export default async function AdminPage() {
  const places = await getPlaces();

  return (
    <div>
      <h1 className="mb-6 font-display text-5xl">
        Spots <span className="text-muted-foreground italic">({places.length})</span>
      </h1>

      <BulkEnrichButton
        targets={places.filter((p) => p.images.length < MIN_PHOTOS).map((p) => ({ id: p.id, title: p.title }))}
      />

      {places.length === 0 ? (
        <EmptyState>Aucun spot. Commencez par en créer un.</EmptyState>
      ) : (
        <ul className="divide-y divide-line rounded-3xl border border-line bg-card">
          {places.map((place) => (
            <li key={place.id} className="flex items-center gap-4 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted">
                <CategoryIcon icon={place.category?.icon} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-medium">
                  {place.title}
                  {place.is_featured && <Star className="size-3.5 fill-ocre text-ocre" />}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {place.chapter?.title ?? "Sans chapitre"} · {place.city} · {place.images.length} photo
                  {place.images.length > 1 ? "s" : ""}
                  {place.gpx_url && " · GPX"}
                </p>
              </div>
              {place.is_free ? <Badge variant="free">FREE</Badge> : <Badge>{priceLabel(place.price_level)}</Badge>}
              <Button asChild size="icon" variant="ghost" aria-label={`Modifier ${place.title}`}>
                <Link href={`/admin/lieux/${place.id}`}>
                  <Pencil />
                </Link>
              </Button>
              <ConfirmDelete action={deletePlace.bind(null, place.id)} label={place.title} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
