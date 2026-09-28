import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border border-line bg-muted text-foreground",
        free: "bg-emerald-500 text-white",
        accent: "bg-ocre/15 text-[#8a5a12] ring-1 ring-ocre/40 dark:text-ocre",
        glass: "border border-white/15 bg-black/40 text-white backdrop-blur-md",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({ className, variant, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
