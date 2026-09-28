import { CategoryIcon } from "@/components/category-icon";
import { cn } from "@/lib/utils";

export function MarkerPin({
  color,
  icon,
  label,
  index,
  selected,
  highlighted,
}: {
  color: string;
  icon?: string | null;
  label: string;
  index?: number;
  selected: boolean;
  /** Survol de la carte correspondante dans la liste. */
  highlighted?: boolean;
}) {
  const emphasized = selected || highlighted;
  return (
    <div className="group relative flex cursor-pointer flex-col items-center">
      {highlighted && !selected && (
        <span aria-hidden className="absolute top-0 size-8 animate-ping rounded-full opacity-60" style={{ backgroundColor: color }} />
      )}
      <div
        className={cn(
          "relative grid place-items-center rounded-full border-2 border-white text-white shadow-[0_2px_10px_rgb(0_0_0/0.35)] transition-transform duration-150 ease-out group-hover:scale-110",
          selected ? "size-10 scale-110" : "size-8",
          highlighted && !selected && "scale-125",
        )}
        style={{ backgroundColor: color }}
      >
        {index !== undefined ? (
          <span className="font-mono text-xs font-semibold">{index + 1}</span>
        ) : (
          <CategoryIcon icon={icon} className={selected ? "size-5" : "size-4"} strokeWidth={2.25} />
        )}
      </div>
      <span
        className={cn(
          "pointer-events-none absolute top-full mt-1 whitespace-nowrap rounded-full bg-black/80 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur",
          emphasized ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        {label}
      </span>
    </div>
  );
}
