import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  kicker,
  title,
  action,
  className,
}: {
  kicker: string;
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex items-end justify-between gap-6 border-b border-line pb-4", className)}>
      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">{kicker}</p>
        <h2 className="mt-2 font-display text-4xl leading-none md:text-5xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-line-strong p-10 text-center text-sm leading-relaxed text-muted-foreground">
      {children}
    </div>
  );
}
