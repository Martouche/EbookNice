// Fournisseurs de photos HD. Aucune dépendance Next.js : utilisé par le script CLI et les Server Actions.

export type PhotoProvider = "wikimedia" | "unsplash" | "pexels";

export interface PhotoCandidate {
  provider: PhotoProvider;
  /** Identifiant stable chez le fournisseur (dédoublonnage). */
  sourceId: string;
  /** URL de téléchargement (Commons) ou URL CDN à afficher telle quelle (Unsplash / Pexels). */
  url: string;
  width: number;
  height: number;
  author: string;
  license: string;
  licenseUrl?: string;
  /** Page de la photo chez le fournisseur (lien d'attribution). */
  sourceUrl: string;
  /** Unsplash impose le hotlink + un appel de suivi à chaque utilisation. */
  hotlink: boolean;
  trackUrl?: string;
  /** Texte utilisé pour juger la pertinence (titre du fichier, description). */
  text: string;
}

const USER_AGENT = `NiceGuideDesLocaux/1.0 (${process.env.NEXT_PUBLIC_SITE_URL ?? "https://ebook.martinvantalon.com"})`;

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

/** Licences réutilisables commercialement et modifiables (pas de NC / ND). */
function isReusableLicense(license: string) {
  const l = license.toLowerCase();
  if (/\b(nc|nd)\b|non-?commercial|no ?deriv|fair use/.test(l)) return false;
  return /^(cc0|cc[ -]by|public domain|pd|attribution)/.test(l);
}

/** Reproductions d'œuvres et documents anciens : on veut des photos du lieu aujourd'hui. */
const ARTWORK = /\b(1[0-8]\d\d|19[0-4]\d)\b|\bpar [A-ZÉ][a-zé]+ [A-Z]|painting|peinture|tableau|aquarelle|lithograph/;

const EXCLUDED_FILES = /\b(map|carte|plan|logo|blason|coat of arms|armoiries|drawing|dessin|gravure|engraving|postcard|carte postale|panneau|sign|diagram|scan)\b/i;

// ---------------------------------------------------------------------------
// Wikimedia Commons — sans clé, idéal pour les lieux emblématiques.
// ---------------------------------------------------------------------------
interface CommonsPage {
  title: string;
  imageinfo?: {
    thumburl?: string;
    thumbwidth?: number;
    thumbheight?: number;
    width: number;
    height: number;
    mime: string;
    descriptionurl: string;
    extmetadata?: Record<string, { value: string } | undefined>;
  }[];
}

export async function searchWikimedia(query: string, limit = 20): Promise<PhotoCandidate[]> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1920",
    iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl|ImageDescription",
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) return [];
  const json = (await res.json()) as { query?: { pages?: Record<string, CommonsPage & { index?: number }> } };
  const pages = Object.values(json.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  return pages.flatMap((page) => {
    const info = page.imageinfo?.[0];
    const meta = info?.extmetadata ?? {};
    const license = meta.LicenseShortName?.value ?? "";
    if (!info || info.mime !== "image/jpeg" || info.width < 1200 || !isReusableLicense(license)) return [];
    if (EXCLUDED_FILES.test(page.title) || ARTWORK.test(page.title)) return [];
    // Attribution obligatoire : sans auteur identifiable, la photo est écartée.
    const author = stripHtml(meta.Artist?.value ?? "");
    if (!author || /unknown|inconnu|anonym/i.test(author)) return [];
    return [
      {
        provider: "wikimedia" as const,
        sourceId: page.title,
        url: info.thumburl ?? info.descriptionurl,
        width: info.thumbwidth ?? info.width,
        height: info.thumbheight ?? info.height,
        author,
        license,
        licenseUrl: meta.LicenseUrl?.value,
        sourceUrl: info.descriptionurl,
        hotlink: false,
        text: `${page.title} ${stripHtml(meta.ImageDescription?.value ?? "")}`,
      },
    ];
  });
}

// ---------------------------------------------------------------------------
// Unsplash — clé requise (UNSPLASH_ACCESS_KEY). Guidelines : hotlink obligatoire + suivi.
// ---------------------------------------------------------------------------
interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  description: string | null;
  alt_description: string | null;
  urls: { raw: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
}

export async function searchUnsplash(query: string, limit = 10): Promise<PhotoCandidate[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return [];
  const params = new URLSearchParams({ query, per_page: String(limit), orientation: "landscape", content_filter: "high" });
  const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { results: UnsplashPhoto[] };
  const utm = "utm_source=guide_des_locaux&utm_medium=referral";
  return json.results.map((p) => ({
    provider: "unsplash" as const,
    sourceId: p.id,
    url: `${p.urls.raw}&w=1920&q=80&fm=jpg&fit=max`,
    width: 1920,
    height: Math.round((1920 * p.height) / p.width),
    author: p.user.name,
    license: "Unsplash License",
    licenseUrl: "https://unsplash.com/license",
    sourceUrl: `${p.links.html}?${utm}`,
    hotlink: true,
    trackUrl: p.links.download_location,
    text: `${p.description ?? ""} ${p.alt_description ?? ""}`,
  }));
}

export async function trackUnsplashDownload(trackUrl: string) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return;
  await fetch(trackUrl, { headers: { Authorization: `Client-ID ${key}` } }).catch(() => undefined);
}

// ---------------------------------------------------------------------------
// Pexels — clé requise (PEXELS_API_KEY).
// ---------------------------------------------------------------------------
interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  alt: string;
  photographer: string;
  src: { large2x: string };
}

export async function searchPexels(query: string, limit = 10): Promise<PhotoCandidate[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];
  const params = new URLSearchParams({ query, per_page: String(limit), orientation: "landscape" });
  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, { headers: { Authorization: key } });
  if (!res.ok) return [];
  const json = (await res.json()) as { photos: PexelsPhoto[] };
  return json.photos.map((p) => ({
    provider: "pexels" as const,
    sourceId: String(p.id),
    url: p.src.large2x,
    width: 1880,
    height: Math.round((1880 * p.height) / p.width),
    author: p.photographer,
    license: "Pexels License",
    licenseUrl: "https://www.pexels.com/license/",
    sourceUrl: p.url,
    hotlink: true,
    text: p.alt,
  }));
}
