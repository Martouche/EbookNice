import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div aria-hidden className={cn("animate-pulse rounded-2xl bg-muted", className)} {...props} />;
}

/** Squelette d'une carte lieu (mêmes proportions que PlaceCard → zéro layout shift). */
export function PlaceCardSkeleton({ compact }: { compact?: boolean }) {
  return <Skeleton className={cn("rounded-3xl", compact ? "aspect-[16/10]" : "aspect-[4/5]")} />;
}
