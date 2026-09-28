"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export function Chip({
  active,
  className,
  children,
  ...props
}: HTMLMotionProps<"button"> & { active?: boolean }) {
  return (
    <motion.button
      type="button"
      aria-pressed={active}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-100 [&_svg]:size-3.5",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-line text-muted-foreground hover:border-line-strong hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
