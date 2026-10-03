import { OrderBoard, type OrderGroup } from "@/components/admin/order-board";
import { EmptyState } from "@/components/section-heading";
import { CATEGORY_SHOWCASE } from "@/lib/constants";
import { getCategories, getPlaces } from "@/lib/data";

export default async function AdminOrderPage() {
  const [places, categories] = await Promise.all([getPlaces(), getCategories()]);

  // Une liste par catégorie, dans l'ordre des « envies » de l'accueil, puis les éventuelles autres catégories.
  const known = CATEGORY_SHOWCASE.map((c) => c.slug);
  const ordered = [
    ...known.flatMap((slug) => categories.filter((c) => c.slug === slug)),
    ...categories.filter((c) => !known.includes(c.slug)),
  ];
  const groups: OrderGroup[] = ordered
    .map((c) => ({
      slug: c.slug,
      title: CATEGORY_SHOWCASE.find((s) => s.slug === c.slug)?.title ?? c.name,
      icon: c.icon,
      places: places.filter((p) => p.category_id === c.id),
    }))
    .filter((g) => g.places.length > 0);

  return (
    <div>
      <h1 className="mb-2 font-display text-5xl">Ordre d&apos;affichage</h1>
      <p className="mb-6 text-sm text-muted-foreground">Choisissez quels spots apparaissent en premier dans chaque catégorie.</p>
      {groups.length === 0 ? <EmptyState>Aucun spot à ordonner.</EmptyState> : <OrderBoard groups={groups} />}
    </div>
  );
}
