import { ArrowUpRight, Globe, Lock, ShieldCheck, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "@/components/link";
import { redirect } from "next/navigation";
import { deleteItinerary, setItineraryVisibility } from "@/app/actions/itineraries";
import { EmptyState } from "@/components/section-heading";
import { SignOutForm } from "@/components/sign-out-form";
import { Button } from "@/components/ui/button";
import { FAVORITES_TITLE } from "@/lib/constants";
import { getFavoriteIds, getMyItineraries, getSession } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.meta.account };
}

export default async function AccountPage() {
  const [{ user, profile }, itineraries, favoriteIds, { t, locale }] = await Promise.all([
    getSession(),
    getMyItineraries(),
    getFavoriteIds(),
    getI18n(),
  ]);
  if (!user) redirect("/connexion?next=/compte");

  const name = profile?.full_name || user.email?.split("@")[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
      <header className="border-b border-line pb-8">
        <p className="font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">{t.account.kicker}</p>
        <h1 className="mt-2 font-display text-[clamp(2.5rem,11vw,3.75rem)] leading-[1] text-balance break-words">
          {t.account.hello}<span className="italic">{name}</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{user.email}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/favoris">{t.account.favorites(favoriteIds.length)}</Link>
          </Button>
          {profile?.role === "ADMIN" && (
            <Button asChild variant="outline">
              <Link href="/admin">
                <ShieldCheck className="text-ocre" />
                {t.account.backoffice}
              </Link>
            </Button>
          )}
          <SignOutForm label={t.account.logout} />
        </div>
      </header>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-3xl">{t.account.itineraries}</h2>
        {itineraries.length === 0 ? (
          <EmptyState>
            {t.account.noItineraries}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {itineraries.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-4">
                <Link href={`/carnet/${it.id}`} className="group min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-medium group-hover:underline">
                    {it.title === FAVORITES_TITLE ? t.carnet.favoritesTitle : it.title}
                    <ArrowUpRight className="size-3.5 text-muted-foreground" />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.account.steps(it.place_ids.length)} · {new Date(it.created_at).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR")}
                  </p>
                </Link>
                <form action={setItineraryVisibility.bind(null, it.id, !it.is_public)}>
                  <Button type="submit" size="sm" variant="outline" title={it.is_public ? t.account.makePrivate : t.account.makePublic}>
                    {it.is_public ? <Globe /> : <Lock />}
                    {it.is_public ? t.account.public : t.account.private}
                  </Button>
                </form>
                <form action={deleteItinerary.bind(null, it.id)}>
                  <Button type="submit" size="icon" variant="ghost" aria-label={t.account.deleteItinerary}>
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
