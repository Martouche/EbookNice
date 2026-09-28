"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Download, Loader2, Printer, Share2 } from "lucide-react";
import { useState, useTransition } from "react";
import { shareFavorites } from "@/app/actions/itineraries";
import { Button } from "@/components/ui/button";
import { placesToGpx } from "@/lib/gpx";
import type { PlaceWithRelations } from "@/lib/types";
import { slugify } from "@/lib/utils";

interface CarnetActionsProps {
  title: string;
  places: PlaceWithRelations[];
  /** Itinéraire déjà publié : on partage son URL. Sinon, on publie le carnet de favoris. */
  itineraryId?: string;
}

export function CarnetActions({ title, places, itineraryId }: CarnetActionsProps) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const flash = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 2400);
  };

  const share = () =>
    startTransition(async () => {
      let id = itineraryId;
      if (!id) {
        const result = await shareFavorites();
        if (!("id" in result) || !result.id) return flash("Impossible de publier le carnet.");
        id = result.id;
      }
      const url = `${window.location.origin}/carnet/${id}`;
      if (navigator.share) {
        await navigator.share({ title, text: "Mon carnet de la Côte d'Azur", url }).catch(() => undefined);
      } else {
        await navigator.clipboard.writeText(url);
        flash("Lien copié !");
      }
    });

  const exportGpx = () => {
    const blob = new Blob([placesToGpx(title, places, window.location.origin)], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: `${slugify(title) || "carnet"}.gpx` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <Button variant="accent" onClick={share} disabled={pending || places.length === 0}>
        {pending ? <Loader2 className="animate-spin" /> : <Share2 />}
        Partager
      </Button>
      <Button variant="outline" onClick={exportGpx} disabled={places.length === 0}>
        <Download />
        Export GPX
      </Button>
      <Button variant="outline" onClick={() => window.print()} disabled={places.length === 0}>
        <Printer />
        PDF
      </Button>
      <AnimatePresence>
        {feedback && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex items-center gap-1 text-sm text-emerald-500"
          >
            <Check className="size-4" />
            {feedback}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
