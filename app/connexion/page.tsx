import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { QuickAuth } from "@/components/auth/quick-auth";
import { getSession } from "@/lib/data";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erreur?: string }>;
}) {
  const [{ next: nextParam, erreur }, { user }] = await Promise.all([searchParams, getSession()]);
  const next = nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/compte";
  if (user) redirect(next);

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-4 py-12 md:grid-cols-2 md:items-center md:px-8 md:py-24">
      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">Votre carnet de voyage</p>
        <h1 className="mt-3 font-display text-6xl leading-[0.9] md:text-7xl">
          Gardez vos <span className="italic text-muted-foreground">adresses</span> sous la main.
        </h1>
        <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">
          Sauvegardez vos coups de cœur, composez vos itinéraires et partagez votre carnet avec vos proches.
        </p>
      </div>
      <div className="space-y-6 rounded-[2rem] border border-line bg-card p-6 md:p-8">
        <QuickAuth next={next} />
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          <span className="h-px flex-1 bg-line" />
          ou avec un mot de passe
          <span className="h-px flex-1 bg-line" />
        </div>
        <AuthForm
          next={next}
          initialError={erreur ? "Ce lien de confirmation est invalide ou a expiré." : undefined}
        />
      </div>
    </div>
  );
}
