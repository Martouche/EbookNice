import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },    ],
  },
  async headers() {
    // Vidéos du hero : cache CDN + navigateur (noms non versionnés → 7 jours, revalidation en arrière-plan).
    return [
      // Service worker : toujours revalidé, pour que les mises à jour du cache hors ligne arrivent vite.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] },
      {
        source: "/videos/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
  async redirects() {
    return [{ source: "/places/:slug", destination: "/lieux/:slug", permanent: true }];
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
