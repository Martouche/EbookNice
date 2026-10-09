"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { localizePath } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  message?: string;
}

/** N'autorise que les redirections internes (évite les open-redirects). */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/compte";
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: (await getI18n()).t.auth.errors.invalidCredentials };

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: (await getI18n()).t.auth.errors.passwordTooShort };

  const supabase = await createClient();
  const next = safeNext(formData.get("next"));
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email") ?? ""),
    password,
    options: {
      data: { full_name: String(formData.get("full_name") ?? "").trim() || null },
      emailRedirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { error: error.message };

  // Confirmation d'email désactivée : la session est déjà ouverte.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect(next);
  }
  return { message: (await getI18n()).t.auth.errors.confirmEmail };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/** Mot de passe oublié : même réponse que le compte existe ou non (on ne révèle pas les adresses inscrites). */
export async function requestPasswordReset(_: AuthState, formData: FormData): Promise<AuthState> {
  const { locale, t } = await getI18n();
  const email = String(formData.get("email") ?? "").trim();
  const supabase = await createClient();
  const next = localizePath("/nouveau-mot-de-passe", locale);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
  });
  if (error?.status === 429) return { error: t.auth.tooMany };
  return { message: t.auth.forgot.sent };
}

/** Nouveau mot de passe, après ouverture du lien reçu par email (session ouverte par /auth/callback). */
export async function updatePassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const { locale, t } = await getI18n();
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: t.auth.errors.passwordTooShort };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.code === "same_password" ? error.message : t.auth.forgot.expired };

  revalidatePath("/", "layout");
  redirect(localizePath("/compte", locale));
}
