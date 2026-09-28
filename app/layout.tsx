import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";
import { FavoritesProvider } from "@/components/favorites-provider";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { getFavoriteIds, getSession } from "@/lib/data";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});
const sans = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Nice & Côte d'Azur — Le Guide des Locaux",
    template: "%s · Le Guide des Locaux",
  },
  description:
    "L'ebook interactif des Niçois : plages secrètes, points de vue, tables locales et randonnées de la Côte d'Azur.",
  openGraph: { siteName: "Le Guide des Locaux", locale: "fr_FR", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0a" },
    { media: "(prefers-color-scheme: light)", color: "#f6f2ea" },
  ],
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ user, profile }, favoriteIds] = await Promise.all([getSession(), getFavoriteIds()]);

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable} ${mono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <FavoritesProvider key={user?.id ?? "anon"} initialIds={favoriteIds} isAuthed={!!user}>
            <SiteHeader isAdmin={profile?.role === "ADMIN"} />
            <main className="min-h-[calc(100dvh-4rem)] pb-24 md:pb-0">{children}</main>
            <BottomNav />
          </FavoritesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
