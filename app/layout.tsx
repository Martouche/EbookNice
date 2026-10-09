import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";
import { FavoritesProvider } from "@/components/favorites-provider";
import { ServiceWorker } from "@/components/service-worker";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { getFavoriteIds, getSession } from "@/lib/data";
import { I18nProvider } from "@/lib/i18n/client";
import { getI18n } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});
const sans = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const siteName = locale === "en" ? "The Locals' Guide" : "Le Guide des Locaux";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.title, template: `%s · ${siteName}` },
    description: t.meta.description,
    openGraph: { siteName, locale: locale === "en" ? "en_GB" : "fr_FR", alternateLocale: locale === "en" ? "fr_FR" : "en_GB", type: "website" },
    twitter: { card: "summary_large_image" },
    // iPhone : « Sur l'écran d'accueil » ouvre le guide en plein écran, comme une app.
    appleWebApp: { capable: true, title: "Nice.", statusBarStyle: "black-translucent" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0a" },
    { media: "(prefers-color-scheme: light)", color: "#f6f2ea" },
  ],
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ user, profile }, favoriteIds, { locale }] = await Promise.all([getSession(), getFavoriteIds(), getI18n()]);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable} ${mono.variable} font-sans antialiased`}>
        <I18nProvider locale={locale}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <FavoritesProvider key={user?.id ?? "anon"} initialIds={favoriteIds} isAuthed={!!user}>
            <SiteHeader isAdmin={profile?.role === "ADMIN"} />
            <main className="min-h-[calc(100dvh-var(--header-h))] pb-24 md:pb-0">{children}</main>
            <BottomNav />
            <ServiceWorker />
          </FavoritesProvider>
        </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
