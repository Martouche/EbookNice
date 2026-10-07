import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">{t.notFound.kicker}</p>
      <h1 className="mt-3 font-display text-[clamp(2.5rem,11vw,3.75rem)] leading-[1] text-balance break-words">
        {t.notFound.title[0]}<span className="italic text-muted-foreground">{t.notFound.title[1]}</span>
      </h1>
      <p className="mt-4 text-muted-foreground">{t.notFound.lead}</p>
      <Button asChild variant="accent" className="mt-8">
        <Link href="/">{t.notFound.back}</Link>
      </Button>
    </div>
  );
}
