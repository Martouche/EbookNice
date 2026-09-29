import type { ImageCredit } from "@/lib/types";
import { cn } from "@/lib/utils";

const PROVIDER_LABELS: Record<ImageCredit["provider"], string> = {
  wikimedia: "Wikimedia Commons",
  unsplash: "Unsplash",
  pexels: "Pexels",
};

export const creditFor = (credits: ImageCredit[] | null | undefined, url: string) => credits?.find((c) => c.url === url);

/** Attribution d'une photo : « Auteur · licence · source », avec liens (exigence CC BY / BY-SA, Unsplash). */
export function PhotoCredit({ credit, className }: { credit: ImageCredit; className?: string }) {
  return (
    <span className={cn("inline", className)}>
      <a href={credit.source_url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
        {credit.author}
      </a>
      {" · "}
      {credit.license_url ? (
        <a href={credit.license_url} target="_blank" rel="noopener noreferrer license" className="underline-offset-2 hover:underline">
          {credit.license}
        </a>
      ) : (
        credit.license
      )}
      {" · "}
      {PROVIDER_LABELS[credit.provider]}
    </span>
  );
}

/** Crédits de toutes les photos affichées, sous la galerie. */
export function PhotoCredits({ images, credits }: { images: string[]; credits: ImageCredit[] | null | undefined }) {
  const list = images.map((url) => creditFor(credits, url)).filter((c): c is ImageCredit => !!c);
  if (list.length === 0) return null;
  return (
    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
      Photos :{" "}
      {list.map((credit, i) => (
        <span key={credit.url}>
          {i > 0 && " — "}
          <PhotoCredit credit={credit} />
        </span>
      ))}
    </p>
  );
}
