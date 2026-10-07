import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { QuickAuth } from "@/components/auth/quick-auth";
import { getSession } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.meta.login };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erreur?: string }>;
}) {
  const [{ next: nextParam, erreur }, { user }, { t }] = await Promise.all([searchParams, getSession(), getI18n()]);
  const next = nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/compte";
  if (user) redirect(next);

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-4 py-12 md:grid-cols-2 md:items-center md:px-8 md:py-24">
      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">{t.auth.pageKicker}</p>
        <h1 className="mt-3 font-display text-[clamp(2.75rem,12vw,3.75rem)] leading-[0.95] text-balance break-words md:text-7xl">
          {t.auth.pageTitle[0]}<span className="italic text-muted-foreground">{t.auth.pageTitle[1]}</span>{t.auth.pageTitle[2]}
        </h1>
        <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">
          {t.auth.pageLead}
        </p>
      </div>
      <div className="space-y-6 rounded-[2rem] border border-line bg-card p-6 md:p-8">
        <QuickAuth next={next} />
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          <span className="h-px flex-1 bg-line" />
          {t.auth.orPassword}
          <span className="h-px flex-1 bg-line" />
        </div>
        <AuthForm
          next={next}
          initialError={erreur ? t.auth.invalidLink : undefined}
        />
        <p className="text-center text-[11px] text-muted-foreground">
          {t.auth.consent[0]}
          <Link href="/confidentialite" className="underline underline-offset-2 hover:text-foreground">
            {t.auth.consent[1]}
          </Link>
          {t.auth.consent[2]}
        </p>
      </div>
    </div>
  );
}
