"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useOptimistic, useState, useTransition } from "react";
import { toggleFavorite } from "@/app/actions/favorites";

interface FavoritesContextValue {
  isAuthed: boolean;
  isFavorite: (placeId: string) => boolean;
  toggle: (placeId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({
  initialIds,
  isAuthed,
  children,
}: {
  initialIds: string[];
  isAuthed: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ids, setIds] = useState(() => new Set(initialIds));
  const [optimisticIds, applyOptimistic] = useOptimistic(ids, (current, placeId: string) => {
    const next = new Set(current);
    if (next.has(placeId)) next.delete(placeId);
    else next.add(placeId);
    return next;
  });
  const [, startTransition] = useTransition();

  const toggle = useCallback(
    (placeId: string) => {
      if (!isAuthed) {
        router.push(`/connexion?next=${encodeURIComponent(pathname)}`);
        return;
      }
      const shouldFavorite = !optimisticIds.has(placeId);
      startTransition(async () => {
        applyOptimistic(placeId);
        const result = await toggleFavorite(placeId, shouldFavorite);
        if ("ok" in result) {
          setIds((current) => {
            const next = new Set(current);
            if (shouldFavorite) next.add(placeId);
            else next.delete(placeId);
            return next;
          });
        }
      });
    },
    [isAuthed, optimisticIds, pathname, router, applyOptimistic],
  );

  return (
    <FavoritesContext.Provider value={{ isAuthed, isFavorite: (id) => optimisticIds.has(id), toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites doit être utilisé dans <FavoritesProvider>");
  return ctx;
}
