"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SegmentedProps<T extends string> {
  /** Identifiant unique : sert au layoutId de la pastille active. */
  id: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: ReactNode }[];
  className?: string;
}

export function Segmented<T extends string>({ id, value, onChange, options, className }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" className={cn("inline-flex rounded-full border border-line bg-card p-1", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors duration-100 [&_svg]:size-4",
              active ? "text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={`segmented-${id}`}
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
