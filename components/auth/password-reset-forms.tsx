"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { requestPasswordReset, updatePassword, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/client";

function Feedback({ state }: { state: AuthState }) {
  if (!state.error && !state.message) return null;
  return (
    <p role="status" className={state.error ? "text-sm text-red-500" : "text-sm text-emerald-500"}>
      {state.error ?? state.message}
    </p>
  );
}

export function ForgotPasswordForm() {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, {});
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t.auth.email}</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" placeholder={t.auth.emailPlaceholder} />
      </div>
      <Feedback state={state} />
      <Button type="submit" size="lg" variant="accent" className="w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        {t.auth.forgot.submit}
      </Button>
    </form>
  );
}

export function NewPasswordForm() {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, {});
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">{t.auth.forgot.newPassword}</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <Feedback state={state} />
      <Button type="submit" size="lg" variant="accent" className="w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        {t.auth.forgot.save}
      </Button>
    </form>
  );
}
