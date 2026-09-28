import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-line bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-100 focus-visible:border-ocre/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocre/20 disabled:opacity-50";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldBase, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldBase, "min-h-24 py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(fieldBase, "h-11 appearance-none", className)} {...props} />;
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground", className)}
      {...props}
    />
  );
}
