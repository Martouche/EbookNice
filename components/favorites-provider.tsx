"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useOptimistic, useState, useTransition } from "react";
import { toggleFavorite } from "@/app/actions/favorites";

// Chargée au premier clic sur un cœur : vaul + client Supabase hors du bundle initial.
const AuthPrompt = dynamic(() => import("./auth/auth-prompt"), { ssr: false });

interface FavoritesContextValue {
  isAuthed: boolean;
  isFavorite: (placeId: string) => boolean;
  toggle: (placeId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/** Favori demandé avant connexion : appliqué automatiquement au retour (Google / lien magique). */
const PENDING_KEY = "guide:pending-favorite";
const PENDING_TTL_MS = 30 * 60 * 1000;

function readPending() {
  try {
    const [placeId, at] = (window.localStorage.getItem(PENDING_KEY) ?? "").split("|");
    return placeId && Date.now() - Number(at) < PENDING_TTL_MS ? placeId : null;
  } catch {
    return null;
  }
}

function writePending(placeId: string | null) {
  try {
    if (placeId) window.localStorage.setItem(PENDING_KEY, `${placeId}|${Date.now()}`);
    else window.localStorage.removeItem(PENDING_KEY);
  } catch {
    // Stockage indisponible (navigation privée) : le favori sera simplement à re-cliquer.
  }
}

export function FavoritesProvider({
  initialIds,
  isAuthed,
  children,
}: {
  initialIds: string[];
  isAuthed: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [ids, setIds] = useState(() => new Set(initialIds));
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [authPromptLoaded, setAuthPromptLoaded] = useState(false);
  const [optimisticIds, applyOptimistic] = useOptimistic(ids, (current, placeId: string) => {
    const next = new Set(current);
    if (next.has(placeId)) next.delete(placeId);
    else next.add(placeId);
    return next;
  });
  const [, startTransition] = useTransition();

  const commit = useCallback(
    (placeId: string, shouldFavorite: boolean) => {
      startTransition(async () => {
        applyOptimistic(placeId);
        const result = await toggleFavorite(placeId, shouldFavorite);
        if (!("ok" in result)) return;
        setIds((current) => {
          const next = new Set(current);
          if (shouldFavorite) next.add(placeId);
          else next.delete(placeId);
          return next;
        });
      });
    },
    [applyOptimistic],
  );

  const toggle = useCallback(
    (placeId: string) => {
      if (!isAuthed) {
        writePending(placeId);
        setAuthPromptLoaded(true);
        setAuthPromptOpen(true);
        return;
      }
      commit(placeId, !optimisticIds.has(placeId));
    },
    [isAuthed, optimisticIds, commit],
  );

  useEffect(() => {
    if (!isAuthed) return;
    const pending = readPending();
    writePending(null);
    if (!pending) return;
    if (!initialIds.includes(pending)) commit(pending, true);
  }, [isAuthed, initialIds, commit]);

  return (
    <FavoritesContext.Provider value={{ isAuthed, isFavorite: (id) => optimisticIds.has(id), toggle }}>
      {children}
      {!isAuthed && authPromptLoaded && (
        <AuthPrompt open={authPromptOpen} onOpenChange={setAuthPromptOpen} next={pathname} />
      )}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites doit être utilisé dans <FavoritesProvider>");
  return ctx;
}
