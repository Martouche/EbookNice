"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MailCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

/** Connexion en 1 clic : Google OAuth ou lien magique (Supabase Auth, flux PKCE → /auth/callback). */
export function QuickAuth({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "google" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const withGoogle = async () => {
    setStatus("google");
    setError(null);
    const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    if (error) {
      setError("Connexion Google indisponible pour le moment.");
      setStatus("idle");
    }
  };

  const withMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const { error } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
    if (error) {
      setError(error.status === 429 ? "Trop de tentatives, réessayez dans une minute." : "Envoi impossible, vérifiez l'adresse.");
      setStatus("idle");
      return;
    }
    setStatus("sent");
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "sent" ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center"
          role="status"
        >
          <MailCheck className="size-7 text-emerald-500" />
          <p className="font-medium">Lien envoyé à {email}</p>
          <p className="text-sm text-muted-foreground">Ouvrez-le sur cet appareil : votre adresse sera gardée automatiquement.</p>
        </motion.div>
      ) : (
        <motion.div key="form" exit={{ opacity: 0 }} className="space-y-4">
          <Button type="button" size="lg" variant="outline" className="w-full" onClick={withGoogle} disabled={status !== "idle"}>
            {status === "google" ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
            Continuer avec Google
          </Button>

          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-line" />
            ou
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={withMagicLink} className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              required
              autoComplete="email"
              placeholder="vous@exemple.com"
              aria-label="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" size="lg" variant="accent" className="shrink-0" disabled={status !== "idle"}>
              {status === "sending" ? <Loader2 className="animate-spin" /> : <Sparkles />}
              Lien magique
            </Button>
          </form>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
