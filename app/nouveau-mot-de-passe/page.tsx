import type { Metadata } from "next";
import Link from "@/components/link";
import { NewPasswordForm } from "@/components/auth/password-reset-forms";
import { getSession } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.auth.forgot.newTitle, robots: { index: false } };
}

/** Atteinte via le lien « mot de passe oublié » : /auth/callback a déjà ouvert la session. */
export default async function NewPasswordPage() {
  const [{ user }, { t }] = await Promise.all([getSession(), getI18n()]);
  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-24">
      <h1 className="font-display text-5xl leading-[0.95] text-balance">{t.auth.forgot.newTitle}</h1>
      {user ? (
        <>
          <p className="mt-4 leading-relaxed text-muted-foreground">{t.auth.forgot.newLead}</p>
          <div className="mt-8 rounded-3xl border border-line bg-card p-6 md:p-8">
            <NewPasswordForm />
          </div>
        </>
      ) : (
        <p className="mt-4 leading-relaxed text-muted-foreground">
          {t.auth.forgot.expired}{" "}
          <Link href="/mot-de-passe-oublie" className="text-foreground underline underline-offset-2">
            {t.auth.forgot.link}
          </Link>
        </p>
      )}
    </div>
  );
}
