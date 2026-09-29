import { ArrowUpRight, Globe, Lock, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { deleteItinerary, setItineraryVisibility } from "@/app/actions/itineraries";
import { EmptyState } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { getFavoriteIds, getMyItineraries, getSession } from "@/lib/data";

export const metadata: Metadata = { title: "Mon compte" };

export default async function AccountPage() {
  const [{ user, profile }, itineraries, favoriteIds] = await Promise.all([
    getSession(),
    getMyItineraries(),
    getFavoriteIds(),
  ]);
  if (!user) redirect("/connexion?next=/compte");

  const name = profile?.full_name || user.email?.split("@")[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
      <header className="border-b border-line pb-8">
        <p className="font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">Mon compte</p>
        <h1 className="mt-2 font-display text-[clamp(2.5rem,11vw,3.75rem)] leading-[1] text-balance break-words">
          Bonjour, <span className="italic">{name}</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{user.email}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/favoris">{favoriteIds.length} favori{favoriteIds.length > 1 ? "s" : ""}</Link>
          </Button>
          {profile?.role === "ADMIN" && (
            <Button asChild variant="outline">
              <Link href="/admin">
                <ShieldCheck className="text-ocre" />
                Back-office
              </Link>
            </Button>
          )}
          <form action={signOut}>
            <Button variant="ghost" type="submit">
              <LogOut />
              Se déconnecter
            </Button>
          </form>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-3xl">Mes itinéraires</h2>
        {itineraries.length === 0 ? (
          <EmptyState>
            Aucun itinéraire pour l&apos;instant. Composez-en un avec le générateur express de la page d&apos;accueil.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {itineraries.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-4">
                <Link href={`/carnet/${it.id}`} className="group min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-medium group-hover:underline">
                    {it.title}
                    <ArrowUpRight className="size-3.5 text-muted-foreground" />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {it.place_ids.length} étapes · {new Date(it.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </Link>
                <form action={setItineraryVisibility.bind(null, it.id, !it.is_public)}>
                  <Button type="submit" size="sm" variant="outline" title={it.is_public ? "Rendre privé" : "Rendre public"}>
                    {it.is_public ? <Globe /> : <Lock />}
                    {it.is_public ? "Public" : "Privé"}
                  </Button>
                </form>
                <form action={deleteItinerary.bind(null, it.id)}>
                  <Button type="submit" size="icon" variant="ghost" aria-label="Supprimer l'itinéraire">
                    <Trash2 />
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
