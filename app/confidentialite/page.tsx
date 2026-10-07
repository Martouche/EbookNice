import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { PrivacyEn } from "./privacy-en";
import { PrivacyFr } from "./privacy-fr";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: t.meta.privacy,
    description:
      locale === "en"
        ? "What data the Locals' Guide collects, why, for how long, and how to exercise your rights."
        : "Quelles données le Guide des Locaux collecte, pourquoi, combien de temps, et comment exercer vos droits.",
    alternates: { canonical: "/confidentialite" },
  };
}

// Texte juridique : une version complète par langue plutôt qu'un dictionnaire de fragments.
export default async function PrivacyPage() {
  const { locale } = await getI18n();
  return locale === "en" ? <PrivacyEn /> : <PrivacyFr />;
}
