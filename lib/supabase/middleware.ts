import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, detectLocale, isLocale, type Locale } from "@/lib/i18n/config";

const PROTECTED_PREFIXES = ["/favoris", "/compte", "/admin"];
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Langue : `?lang=en|fr` (lien partagé) > cookie existant > langue du navigateur à la première visite.
 * Le cookie est aussi posé sur la requête, pour que le rendu serveur de CETTE requête soit déjà dans la bonne langue.
 */
function resolveLocale(request: NextRequest): { locale: Locale; changed: boolean } {
  const current = request.cookies.get(LOCALE_COOKIE)?.value;
  const fromQuery = request.nextUrl.searchParams.get("lang");
  const locale = isLocale(fromQuery)
    ? fromQuery
    : isLocale(current)
      ? current
      : detectLocale(request.headers.get("accept-language"));
  return { locale, changed: locale !== current };
}

export async function updateSession(request: NextRequest) {
  const { locale, changed } = resolveLocale(request);

  // Lien partagé « ?lang=en » : on mémorise la langue puis on nettoie l'URL, sinon le paramètre
  // primerait à chaque rafraîchissement et le sélecteur FR | EN ne pourrait plus changer la langue.
  if (request.nextUrl.searchParams.has("lang")) {
    const clean = request.nextUrl.clone();
    clean.searchParams.delete("lang");
    const redirect = NextResponse.redirect(clean);
    redirect.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
    return redirect;
  }

  if (changed) request.cookies.set(LOCALE_COOKIE, locale);

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  if (!user && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    response = NextResponse.redirect(url);
  }

  if (changed) response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  return response;
}
