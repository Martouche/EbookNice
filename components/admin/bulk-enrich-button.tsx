"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { enrichPlacePhotos } from "@/app/actions/photos";
import { Button } from "@/components/ui/button";

interface Target {
  id: string;
  title: string;
}

interface LogLine {
  title: string;
  added: number;
  fallback: boolean;
  error?: string;
}

/**
 * Enrichit en série tous les spots sous le seuil de photos. Un appel serveur par spot :
 * progression en direct, et aucun risque de timeout sur Vercel.
 */
export function BulkEnrichButton({ targets }: { targets: Target[] }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  const cancelled = useRef(false);

  const done = log.length;
  const added = log.reduce((sum, l) => sum + l.added, 0);

  const run = async () => {
    setRunning(true);
    setLog([]);
    cancelled.current = false;
    for (const target of targets) {
      if (cancelled.current) break;
      try {
        const r = await enrichPlacePhotos(target.id);
        setLog((l) => [...l, { title: target.title, added: r.added, fallback: r.usedFallback, error: r.added ? undefined : r.error }]);
      } catch {
        setLog((l) => [...l, { title: target.title, added: 0, fallback: false, error: "Erreur réseau" }]);
      }
    }
    setRunning(false);
    router.refresh();
  };

  if (targets.length === 0 && log.length === 0) return null;

  return (
    <div className="mb-6 rounded-3xl border border-line bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">
            {targets.length} spot{targets.length > 1 ? "s" : ""} avec moins de 3 photos
          </p>
          <p className="text-xs text-muted-foreground">Wikimedia Commons (+ Unsplash / Pexels si configurés), crédits inclus.</p>
        </div>
        {running ? (
          <Button variant="outline" onClick={() => (cancelled.current = true)}>
            <X />
            Arrêter
          </Button>
        ) : (
          <Button variant="accent" onClick={run} disabled={targets.length === 0}>
            <Zap />
            Auto-enrichir tous les spots sans photo
          </Button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {(running || log.length > 0) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
            className="overflow-hidden"
          >
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-ocre"
                animate={{ width: `${(done / Math.max(targets.length, 1)) * 100}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
              />
            </div>
            <p className="mt-2 font-mono text-[11px] tracking-wide text-muted-foreground" role="status">
              {running
                ? `${done}/${targets.length} · ${targets[done]?.title ?? ""}…`
                : `${done} lieu${done > 1 ? "x" : ""} analysé${done > 1 ? "s" : ""}, ${added} photo${added > 1 ? "s" : ""} ajoutée${added > 1 ? "s" : ""} avec succès.`}
            </p>
            <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto text-sm">
              {log.map((line) => (
                <li key={line.title} className="flex items-center gap-2">
                  {line.error ? <X className="size-3.5 text-red-500" /> : <Check className="size-3.5 text-emerald-500" />}
                  <span className="truncate">{line.title}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {line.error ?? `+${line.added}${line.fallback ? " · générique" : ""}`}
                  </span>
                </li>
              ))}
              {running && (
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  {targets[done]?.title}
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
