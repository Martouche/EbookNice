"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { useState, useTransition } from "react";
import { enrichPlacePhotos } from "@/app/actions/photos";
import { Button } from "@/components/ui/button";

/** « Auto-générer des photos » : 3 à 5 photos HD trouvées et ajoutées en 1 clic. */
export function AutoPhotosButton({
  placeId,
  disabled,
  onImages,
}: {
  placeId?: string;
  disabled?: boolean;
  onImages: (images: string[]) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "warn" | "error"; text: string } | null>(null);

  const run = () =>
    placeId &&
    startTransition(async () => {
      setMessage(null);
      const result = await enrichPlacePhotos(placeId);
      if (result.added > 0) onImages(result.images);
      if (result.error && result.added === 0) setMessage({ tone: "error", text: result.error });
      else if (result.added === 0) setMessage({ tone: "warn", text: "Déjà 5 photos : retirez-en pour en générer d'autres." });
      else
        setMessage({
          tone: result.usedFallback ? "warn" : "ok",
          text: `${result.added} photo${result.added > 1 ? "s" : ""} ajoutée${result.added > 1 ? "s" : ""}${
            result.usedFallback ? " (dont génériques de catégorie — à vérifier)" : ""
          }.`,
        });
    });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="outline" onClick={run} disabled={!placeId || disabled || pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Search />}
        {pending ? "Recherche de photos…" : "Auto-générer des photos"}
      </Button>
      {!placeId && <span className="text-xs text-muted-foreground">Publiez d&apos;abord le spot.</span>}
      <AnimatePresence>
        {message && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={
              message.tone === "ok" ? "text-sm text-emerald-500" : message.tone === "warn" ? "text-sm text-ocre" : "text-sm text-red-500"
            }
            role="status"
          >
            {message.text}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
