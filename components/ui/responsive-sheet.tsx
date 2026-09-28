"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useIsDesktop } from "@/lib/use-media-query";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "./drawer";

interface ResponsiveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}

/** Bottom sheet (vaul) sur mobile, modale centrée sur desktop. */
export function ResponsiveSheet({ open, onOpenChange, title, description, children }: ResponsiveSheetProps) {
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (!open || !isDesktop) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isDesktop, onOpenChange]);

  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <div className="space-y-2 px-5 pt-3 pb-5">
            <DrawerTitle>{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </div>
          <div className="px-5 pb-8">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : undefined}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-md rounded-[1.75rem] border border-line bg-background p-7"
          >
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 grid size-8 place-items-center rounded-full text-muted-foreground transition-colors duration-100 hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <div className="mb-6 space-y-2 pr-8">
              <h2 className="font-display text-3xl leading-tight">{title}</h2>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
