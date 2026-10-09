"use client";

import { useEffect } from "react";

/** Enregistre /sw.js (consultation hors ligne). En production uniquement : en dev, le cache gênerait le rechargement à chaud. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
  }, []);
  return null;
}

/** Déconnexion : le service worker oublie les pages personnelles mises en cache. */
export function clearOfflinePages() {
  navigator.serviceWorker?.controller?.postMessage("clear-pages");
}
