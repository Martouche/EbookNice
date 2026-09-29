"use client";

import Link from "next/link";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { QuickAuth } from "./quick-auth";

/** Invitation à se connecter au clic sur un cœur (chargée à la demande par FavoritesProvider). */
export default function AuthPrompt({
  open,
  onOpenChange,
  next,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  next: string;
}) {
  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Connectez-vous gratuitement"
      description="Pour enregistrer vos adresses préférées dans votre carnet et les retrouver sur tous vos appareils. 1 clic, sans mot de passe."
    >
      <QuickAuth next={next} />
      <p className="mt-5 text-center text-xs text-muted-foreground">
        Plutôt un mot de passe ?{" "}
        <Link
          href={`/connexion?next=${encodeURIComponent(next)}`}
          onClick={() => onOpenChange(false)}
          className="text-foreground underline underline-offset-2"
        >
          Connexion classique
        </Link>
      </p>
    </ResponsiveSheet>
  );
}
