import type { Metadata } from "next";
import Link from "@/components/link";
import { ForgotPasswordForm } from "@/components/auth/password-reset-forms";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.auth.forgot.title, robots: { index: false } };
}

export default async function ForgotPasswordPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-24">
      <h1 className="font-display text-5xl leading-[0.95] text-balance">{t.auth.forgot.title}</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">{t.auth.forgot.lead}</p>
      <div className="mt-8 rounded-[2rem] border border-line bg-card p-6 md:p-8">
        <ForgotPasswordForm />
      </div>
      <Link href="/connexion" className="mt-6 inline-block text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground">
        {t.auth.forgot.back}
      </Link>
    </div>
  );
}
