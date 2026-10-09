import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  detectLocale,
  isLocale,
  isLocalizable,
  localizePath,
  splitLocalePath,
  type Locale,
} from "@/lib/i18n/config";

const PROTECTED_PREFIXES = ["/favoris", "/compte", "/admin"];
const ONE_YEAR = 60 * 60 * 24 * 365;
const COOKIE_OPTIONS = { path: "/", maxAge: ONE_YEAR, sameSite: "lax" } as const;
// Les robots (Google…) voient chaque URL telle quelle : jamais de redirection selon la langue.
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse/i;

/**
 * Langue = URL : `/en/…` en anglais, le reste en français. En interne, `/en/lieux/x` est réécrit vers
 * `/lieux/x` avec l'en-tête `x-locale: en` (une seule arborescence de pages pour les deux langues).
 *
 * Un visiteur qui préfère l'anglais (cookie, ou navigateur non francophone à la première visite) et arrive sur
 * une URL française est redirigé vers sa version `/en`. `?lang=fr|en` (anciens liens partagés) force la langue.
 */
function resolveLocale(request: NextRequest): { redirect?: string; locale: Locale; path: string; remember: boolean } {
  const { pathname, search, searchParams } = request.nextUrl;
  const { locale: urlLocale, path } = splitLocalePath(pathname);
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const localizable = isLocalizable(path);

  const forced = searchParams.get("lang");
  if (searchParams.has("lang")) {
    const params = new URLSearchParams(search);
    params.delete("lang");
    const target = isLocale(forced) ? forced : (urlLocale ?? DEFAULT_LOCALE);
    const qs = params.toString();
    return { redirect: localizePath(path, target) + (qs ? `?${qs}` : ""), locale: target, path, remember: true };
  }

  // `/en/admin`, `/en/auth/…` : ces routes n'existent qu'en version non préfixée.
  if (urlLocale && !localizable) return { redirect: path + search, locale: urlLocale, path, remember: false };
  if (urlLocale) return { locale: urlLocale, path, remember: localizable && cookie !== urlLocale };

  if (localizable && request.method === "GET" && !BOT.test(request.headers.get("user-agent") ?? "")) {
    const preferred = isLocale(cookie) ? cookie : detectLocale(request.headers.get("accept-language"));
    if (preferred !== DEFAULT_LOCALE) {
      return { redirect: localizePath(path, preferred) + search, locale: preferred, path, remember: cookie !== preferred };
    }
  }
  return { locale: DEFAULT_LOCALE, path, remember: localizable && !isLocale(cookie) };
}

export async function updateSession(request: NextRequest) {
  const { redirect, locale, path, remember } = resolveLocale(request);

  if (redirect) {
    const response = NextResponse.redirect(new URL(redirect, request.url));
    if (remember) response.cookies.set(LOCALE_COOKIE, locale, COOKIE_OPTIONS);
    return response;
  }

  // Les en-têtes sont reconstruits à chaque fois : Supabase peut rafraîchir les cookies de session en cours de route.
  const rewriteTo = path !== request.nextUrl.pathname ? new URL(path + request.nextUrl.search, request.url) : null;
  const makeResponse = () => {
    const headers = new Headers(request.headers);
    // Hors pages du guide (back-office, manifest…), pas d'en-tête : la langue suit le cookie.
    if (isLocalizable(path)) headers.set(LOCALE_HEADER, locale);
    return rewriteTo ? NextResponse.rewrite(rewriteTo, { request: { headers } }) : NextResponse.next({ request: { headers } });
  };
  let response = makeResponse();

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
          response = makeResponse();
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && PROTECTED_PREFIXES.some((p) => path.startsWith(p))) {
    const url = new URL(localizePath("/connexion", locale), request.url);
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    response = NextResponse.redirect(url);
  }

  if (remember) response.cookies.set(LOCALE_COOKIE, locale, COOKIE_OPTIONS);
  return response;
}
