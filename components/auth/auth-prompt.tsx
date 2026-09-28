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
      title="Garde tes coups de cœur"
      description="Connecte-toi en 1 clic pour sauvegarder tes adresses préférées et les retrouver partout."
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
