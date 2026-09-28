"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";

type Mode = "connexion" | "inscription";

export function AuthForm({ next, initialError }: { next: string; initialError?: string }) {
  const [mode, setMode] = useState<Mode>("connexion");
  const [signInState, signInAction, signingIn] = useActionState<AuthState, FormData>(signIn, { error: initialError });
  const [signUpState, signUpAction, signingUp] = useActionState<AuthState, FormData>(signUp, {});

  const isSignUp = mode === "inscription";
  const state = isSignUp ? signUpState : signInState;
  const pending = isSignUp ? signingUp : signingIn;

  return (
    <div className="space-y-6">
      <Segmented
        id="auth-mode"
        value={mode}
        onChange={setMode}
        className="w-full"
        options={[
          { value: "connexion", label: "Connexion" },
          { value: "inscription", label: "Inscription" },
        ]}
      />

      <form action={isSignUp ? signUpAction : signInAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <AnimatePresence initial={false}>
          {isSignUp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 34 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pb-1">
                <Label htmlFor="full_name">Prénom</Label>
                <Input id="full_name" name="full_name" autoComplete="given-name" placeholder="Camille" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="vous@exemple.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={isSignUp ? 8 : undefined}
            autoComplete={isSignUp ? "new-password" : "current-password"}
          />
        </div>

        <AnimatePresence mode="wait">
          {(state.error || state.message) && (
            <motion.p
              key={state.error ?? state.message}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={state.error ? "text-sm text-red-500" : "text-sm text-emerald-500"}
              role="status"
            >
              {state.error ?? state.message}
            </motion.p>
          )}
        </AnimatePresence>

        <Button type="submit" size="lg" variant="accent" className="w-full" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          {isSignUp ? "Créer mon carnet" : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}
