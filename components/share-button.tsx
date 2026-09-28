"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Share } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Partage natif (WhatsApp, Messages…) via navigator.share, sinon copie du lien. */
export function ShareButton({ title, text, className }: { title: string; text?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        if ((e as DOMException).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiez ce lien :", url);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={share}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      aria-label={copied ? "Lien copié" : "Partager"}
      className={cn(
        "relative grid size-9 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md",
        className,
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={copied ? "ok" : "share"}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          {copied ? <Check className="size-4 text-emerald-400" /> : <Share className="size-4" />}
        </motion.span>
      </AnimatePresence>
      <AnimatePresence>
        {copied && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full right-0 mt-2 rounded-full bg-black/80 px-2.5 py-1 text-[11px] whitespace-nowrap"
          >
            Lien copié
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
