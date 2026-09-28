import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">Erreur 404</p>
      <h1 className="mt-3 font-display text-6xl leading-none">
        Perdu dans les <span className="italic text-muted-foreground">ruelles</span>
      </h1>
      <p className="mt-4 text-muted-foreground">Même les Niçois s&apos;égarent parfois dans le Vieux-Nice.</p>
      <Button asChild variant="accent" className="mt-8">
        <Link href="/">Retour au guide</Link>
      </Button>
    </div>
  );
}
