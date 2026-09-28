import Image from "next/image";
import { BLUR_DATA_URL } from "@/lib/image";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/constants";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";

/** Visuel d'un lieu : photo si disponible, sinon couverture typographique teintée par catégorie. */
export function PlaceCover({
  src,
  title,
  category,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority,
  className,
}: {
  src?: string | null;
  title: string;
  category: Category | null;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={title}
        fill
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        className={cn("object-cover", className)}
      />
    );
  }

  const color = CATEGORY_COLORS[category?.slug ?? ""] ?? DEFAULT_CATEGORY_COLOR;
  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ background: `linear-gradient(160deg, ${color} 0%, ${color}cc 45%, #14120f 130%)` }}
    >
      <CategoryIcon
        icon={category?.icon}
        className="absolute -right-6 -bottom-6 size-40 text-white/15"
        strokeWidth={1}
      />
      <span className="absolute top-4 left-4 font-display text-7xl leading-none text-white/25 italic">
        {title.charAt(0)}
      </span>
    </div>
  );
}
