"use client";

import Link from "next/link";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useI18n } from "@/lib/i18n/client";
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
  const { t } = useI18n();
  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t.auth.promptTitle}
      description={t.auth.promptDescription}
    >
      <QuickAuth next={next} />
      <p className="mt-5 text-center text-xs text-muted-foreground">
        {t.auth.passwordInstead}{" "}
        <Link
          href={`/connexion?next=${encodeURIComponent(next)}`}
          onClick={() => onOpenChange(false)}
          className="text-foreground underline underline-offset-2"
        >
          {t.auth.classicLogin}
        </Link>
      </p>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        {t.auth.consent[0]}
        <Link href="/confidentialite" onClick={() => onOpenChange(false)} className="underline underline-offset-2">
          {t.auth.consent[1]}
        </Link>
        {t.auth.consent[2]}
      </p>
    </ResponsiveSheet>
  );
}
